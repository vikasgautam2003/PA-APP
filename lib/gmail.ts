import { useSettingsStore } from "@/store/settingsStore";
import { askGroq } from "@/lib/groq";

const nativeFetch = globalThis.fetch.bind(globalThis);
const GMAIL_API   = "https://gmail.googleapis.com/gmail/v1";

const MEETING_LINK_REGEX =
  /https?:\/\/(?:[a-z0-9-]+\.)?zoom\.us\/j\/[^\s"<>]+|https?:\/\/meet\.google\.com\/[^\s"<>]+|https?:\/\/teams\.microsoft\.com\/[^\s"<>]+/gi;

// Lines that are purely decorative junk from email templates
const JUNK_LINE_RE =
  /^[\s()\[\]#*•·\-_=|/\\~^<>{}@%$!?]+$|^\(\s*[#*]\s*\)$|^\[\s*[#*]\s*\]$|^cid:[^\s]+$/i;

// ── Types ──────────────────────────────────────────────────────────────────────

export type DriveItemType = "sheets" | "docs" | "slides" | "forms" | "drive";

export interface GmailDriveItem {
  type: DriveItemType;
  url: string;
}

export interface GmailAttachment {
  filename: string;
  mimeType: string;
  attachmentId: string;
  size: number;
}

export interface GmailMessage {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  body: string;
  bodyHtml: string;
  meetingLinks: string[];
  driveLinks: GmailDriveItem[];
  isRead: boolean;
  attachments: GmailAttachment[];
}

// ── Drive link metadata ────────────────────────────────────────────────────────

export const DRIVE_META: Record<DriveItemType, { icon: string; label: string; color: string; bgColor: string }> = {
  sheets: { icon: "📊", label: "Sheets",     color: "#1e8e3e", bgColor: "rgba(30,142,62,0.12)"  },
  docs:   { icon: "📝", label: "Docs",       color: "#1a73e8", bgColor: "rgba(26,115,232,0.12)" },
  slides: { icon: "📽️", label: "Slides",     color: "#e37400", bgColor: "rgba(227,116,0,0.12)"  },
  forms:  { icon: "📋", label: "Forms",      color: "#7c3aed", bgColor: "rgba(124,58,237,0.12)" },
  drive:  { icon: "📁", label: "Drive file", color: "#5f6368", bgColor: "rgba(95,99,104,0.12)"  },
};

const DRIVE_PATTERNS: { type: DriveItemType; re: RegExp }[] = [
  { type: "sheets", re: /https?:\/\/docs\.google\.com\/spreadsheets\/[^\s"<>)\]]+/gi },
  { type: "docs",   re: /https?:\/\/docs\.google\.com\/document\/[^\s"<>)\]]+/gi    },
  { type: "slides", re: /https?:\/\/docs\.google\.com\/presentation\/[^\s"<>)\]]+/gi },
  { type: "forms",  re: /https?:\/\/docs\.google\.com\/forms\/[^\s"<>)\]]+/gi       },
  { type: "drive",  re: /https?:\/\/drive\.google\.com\/(?:file|drive)\/[^\s"<>)\]]+/gi },
];

function extractDriveLinks(text: string): GmailDriveItem[] {
  const seen = new Set<string>();
  const result: GmailDriveItem[] = [];
  for (const { type, re } of DRIVE_PATTERNS) {
    // Reset lastIndex before each use since flag g keeps state
    re.lastIndex = 0;
    const matches = text.match(re) ?? [];
    for (const raw of matches) {
      const url = raw.replace(/[.,;)>\]"']+$/, "");
      if (!seen.has(url)) { seen.add(url); result.push({ type, url }); }
    }
  }
  return result;
}

// ── Auth helpers ──────────────────────────────────────────────────────────────

export async function refreshAccessToken(): Promise<string | null> {
  const { gmailRefreshToken, gmailClientId, gmailClientSecret, setGmailTokens } = useSettingsStore.getState();
  if (!gmailRefreshToken || !gmailClientId || !gmailClientSecret) return null;
  try {
    const res = await nativeFetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: gmailClientId, client_secret: gmailClientSecret,
        refresh_token: gmailRefreshToken, grant_type: "refresh_token",
      }).toString(),
    });
    const data = await res.json() as Record<string, unknown>;
    if (typeof data.access_token === "string") {
      setGmailTokens(data.access_token, gmailRefreshToken);
      return data.access_token;
    }
  } catch {}
  return null;
}

async function gmailFetch(endpoint: string, token: string): Promise<unknown> {
  const res = await nativeFetch(`${GMAIL_API}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      const retry = await nativeFetch(`${GMAIL_API}${endpoint}`, {
        headers: { Authorization: `Bearer ${newToken}` },
      });
      if (!retry.ok) throw new Error(`Gmail API ${retry.status}`);
      return retry.json();
    }
    throw new Error("Gmail token expired. Please reconnect.");
  }
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error(
      ((errBody.error as Record<string, unknown>)?.message as string) ?? `Gmail API ${res.status}`
    );
  }
  return res.json();
}

// ── Decoding helpers ──────────────────────────────────────────────────────────

/** Read charset from a Content-Type header value, e.g. "text/html; charset=windows-1252" */
function parseCharset(contentType: string): string {
  const m = contentType.match(/charset\s*=\s*["']?([^;"'\s]+)/i);
  if (!m) return "utf-8";
  const cs = m[1].toLowerCase().replace(/^"|"$/g, "");
  if (cs === "latin1" || cs === "iso-8859-1" || cs === "iso8859-1") return "iso-8859-1";
  if (cs.includes("1252") || cs === "ansi" || cs === "cp1252")      return "windows-1252";
  return cs;
}

/** Decode a base64url string to a JS string, respecting the declared charset */
function decodePartData(b64: string, charset = "utf-8"): string {
  const binary = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  try {
    return new TextDecoder(charset, { fatal: false }).decode(bytes);
  } catch {
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  }
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&ndash;|&#8211;/g, "–").replace(/&mdash;|&#8212;/g, "—")
    .replace(/&hellip;|&#8230;/g, "…")
    .replace(/&rsquo;|&#8217;/g, "'").replace(/&lsquo;|&#8216;/g, "'")
    .replace(/&rdquo;|&#8221;/g, "”").replace(/&ldquo;|&#8220;/g, "“")
    .replace(/&#(\d+);/g, (_, c: string) => String.fromCharCode(parseInt(c, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, c: string) => String.fromCharCode(parseInt(c, 16)));
}

function looksLikeHtml(text: string): boolean {
  return /<(p|div|span|table|td|tr|br|img|a|ul|ol|li|h[1-6]|strong|em|b|i|style|html|body|head)[\s>]/i.test(text);
}

function htmlToText(html: string): string {
  const lines = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<img[^>]*>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(p|div|tr|li|h[1-6]|blockquote|table|thead|tbody|tfoot)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .split("\n")
    .map((l) => decodeHtmlEntities(l).replace(/\s+/g, " ").trim())
    .filter((l) => l.length > 0 && !JUNK_LINE_RE.test(l));
  return lines.join("\n");
}

/** Strip background/color/font-size properties from a style="" value string */
function cleanInlineStyle(style: string): string {
  return style
    .split(";")
    .filter((prop) => {
      const name = prop.split(":")[0].trim().toLowerCase();
      return (
        name !== "background" &&
        name !== "background-color" &&
        name !== "background-image" &&
        name !== "color" &&
        name !== "font-family"
      );
    })
    .join(";");
}

function sanitizeForDisplay(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<link[^>]*>/gi, "").replace(/<meta[^>]*>/gi, "")
    .replace(/<base[^>]*>/gi, "")
    .replace(/\s+on\w+\s*=\s*(["'])[^"']*\1/gi, "")
    .replace(/(href|src)\s*=\s*(["'])javascript:[^"']*\2/gi, '$1=$2#$2')
    // Strip bgcolor / background / text HTML attributes (old email table tricks)
    .replace(/\s+(?:bgcolor|background|text)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    // Strip background, background-color, color from inline style="" attributes
    .replace(/style\s*=\s*"([^"]*)"/gi, (_m, s: string) => {
      const cleaned = cleanInlineStyle(s).replace(/^;+|;+$/g, "").trim();
      return cleaned ? `style="${cleaned}"` : "";
    })
    .replace(/style\s*=\s*'([^']*)'/gi, (_m, s: string) => {
      const cleaned = cleanInlineStyle(s).replace(/^;+|;+$/g, "").trim();
      return cleaned ? `style='${cleaned}'` : "";
    })
    // Hide tracking 1×1 images
    .replace(/<img[^>]*(?:width\s*=\s*["']?1["']?|height\s*=\s*["']?1["']?)[^>]*>/gi, "")
    .replace(/<img[^>]*>/gi, "")
    .replace(/<\/?(html|head|body)[^>]*>/gi, "")
    // Rewrite <a href> → data-href so our click handler can open them externally
    .replace(
      /<a\s+([^>]*)href\s*=\s*(["'])([^"']+)\2([^>]*)>/gi,
      (_m, before: string, _q: string, href: string, after: string) =>
        `<a ${before}${after} data-href="${href}" style="color:var(--accent);text-decoration:underline;cursor:pointer;">`
    );
}

// ── Part type ─────────────────────────────────────────────────────────────────

type GmailPart = {
  partId?: string;
  mimeType?: string;
  filename?: string;
  headers?: { name: string; value: string }[];
  body?: { data?: string; attachmentId?: string; size?: number };
  parts?: GmailPart[];
};

function getHeader(part: GmailPart, name: string): string {
  return part.headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

// ── Main fetch ────────────────────────────────────────────────────────────────

export async function fetchMeetingEmails(): Promise<GmailMessage[]> {
  const { gmailToken } = useSettingsStore.getState();
  if (!gmailToken) return [];

  try {
    const query = encodeURIComponent("in:inbox newer_than:7d");
    const list = await gmailFetch(
      `/users/me/messages?q=${query}&maxResults=20`, gmailToken
    ) as { messages?: { id: string }[] };
    if (!list.messages?.length) return [];

    const messages: GmailMessage[] = [];

    for (const msg of list.messages.slice(0, 10)) {
      try {
        const detail = await gmailFetch(
          `/users/me/messages/${msg.id}?format=full`, gmailToken
        ) as {
          payload?: GmailPart & { headers?: { name: string; value: string }[] };
          snippet?: string;
          labelIds?: string[];
        };

        const hdrs    = detail.payload?.headers ?? [];
        const subject = hdrs.find((h) => h.name === "Subject")?.value ?? "(No subject)";
        const from    = hdrs.find((h) => h.name === "From")?.value    ?? "Unknown";
        const date    = hdrs.find((h) => h.name === "Date")?.value    ?? "";
        const snippet = detail.snippet ?? "";

        const meetingLinks: string[] = [];
        const attachments: GmailAttachment[] = [];
        let rawPlain = "";
        let rawHtml  = "";

        function extractParts(part: GmailPart) {
          const contentType = getHeader(part, "content-type");
          const charset     = parseCharset(contentType);

          // Collect real attachments (have filename + attachmentId)
          if (part.filename && part.body?.attachmentId) {
            attachments.push({
              filename:     part.filename,
              mimeType:     part.mimeType ?? "application/octet-stream",
              attachmentId: part.body.attachmentId,
              size:         part.body.size ?? 0,
            });
          }

          // Decode inline body data
          if (part.body?.data && !part.body.attachmentId) {
            const decoded = decodePartData(part.body.data, charset);
            meetingLinks.push(
              ...(decoded.match(MEETING_LINK_REGEX) ?? []).map((l) => l.replace(/['"]/g, ""))
            );
            if (part.mimeType === "text/plain" && !rawPlain) rawPlain = decoded;
            if (part.mimeType === "text/html"  && !rawHtml)  rawHtml  = decoded;
          }

          if (part.parts) part.parts.forEach(extractParts);
        }

        if (detail.payload) extractParts(detail.payload as GmailPart);

        // Handle single-part messages (no multipart wrapper)
        if (!rawPlain && !rawHtml && detail.payload?.body?.data) {
          const ct      = getHeader(detail.payload as GmailPart, "content-type");
          const charset = parseCharset(ct);
          const decoded = decodePartData(detail.payload.body.data, charset);
          if (looksLikeHtml(decoded)) rawHtml = decoded; else rawPlain = decoded;
        }

        // If text/plain itself contains HTML markup, promote it
        if (rawPlain && looksLikeHtml(rawPlain)) {
          if (!rawHtml) rawHtml = rawPlain;
          rawPlain = "";
        }

        // Build body text + sanitized HTML (prefer HTML)
        let body     = "";
        let bodyHtml = "";
        const sourceText = rawHtml || rawPlain;

        if (rawHtml) {
          body     = htmlToText(rawHtml).slice(0, 2000);
          bodyHtml = sanitizeForDisplay(rawHtml);
        } else if (rawPlain) {
          body = rawPlain
            .split("\n")
            .map((l) => decodeHtmlEntities(l.trim()))
            .filter((l) => l.length > 0 && !JUNK_LINE_RE.test(l))
            .join("\n")
            .slice(0, 2000);
        }

        // Drive link extraction — scan both decoded source and snippet
        const driveLinks = extractDriveLinks(sourceText + "\n" + snippet);

        const snippetLinks = snippet.match(MEETING_LINK_REGEX) ?? [];
        meetingLinks.push(...snippetLinks);

        messages.push({
          id:      msg.id,
          subject,
          from:    from.replace(/<[^>]*>/, "").replace(/^["'\s]+|["'\s]+$/g, "").trim(),
          date,
          snippet: snippet.slice(0, 120),
          body,
          bodyHtml,
          meetingLinks: [...new Set(meetingLinks)],
          driveLinks,
          isRead:  !detail.labelIds?.includes("UNREAD"),
          attachments,
        });
      } catch {}
    }

    return messages;
  } catch (e) {
    console.error("Gmail fetch error:", e);
    return [];
  }
}

export async function rankImportantEmails(emails: GmailMessage[]): Promise<GmailMessage[]> {
  if (emails.length === 0) return [];
  const { groqKey } = useSettingsStore.getState();
  if (!groqKey || emails.length <= 4) return emails.slice(0, 4);
  const list = emails.map((e, i) => `${i}. from="${e.from}" subject="${e.subject}"`).join("\n");
  try {
    const raw = await askGroq(
      `Here are emails from an inbox:\n${list}\n\nPick the top 4 most important/urgent ones for a busy professional. Prioritise: action required, meetings, messages from real people, deadlines. Deprioritise: automated reports, newsletters, system notifications.\nReturn JSON: {"indexes":[n,n,n,n]}`,
    );
    const parsed = JSON.parse(raw) as { indexes: number[] };
    const picked = parsed.indexes.slice(0, 4).map((i) => emails[i]).filter(Boolean);
    return picked.length > 0 ? picked : emails.slice(0, 4);
  } catch {
    return emails.slice(0, 4);
  }
}

export function buildGmailAuthUrl(clientId: string, port: number): string {
  const params = new URLSearchParams({
    client_id: clientId, redirect_uri: `http://localhost:${port}`,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/calendar.readonly",
    ].join(" "),
    access_type: "offline", prompt: "consent",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string, clientId: string, clientSecret: string, port: number,
): Promise<{ access_token: string; refresh_token: string } | null> {
  const body = new URLSearchParams({
    code, client_id: clientId, client_secret: clientSecret,
    redirect_uri: `http://localhost:${port}`, grant_type: "authorization_code",
  }).toString();
  const res = await globalThis.fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body,
  });
  const data = await res.json() as Record<string, unknown>;
  if (typeof data.access_token === "string") {
    return {
      access_token:  data.access_token,
      refresh_token: typeof data.refresh_token === "string" ? data.refresh_token : "",
    };
  }
  throw new Error(
    typeof data.error_description === "string" ? data.error_description
      : typeof data.error === "string" ? `Google error: ${data.error}`
      : `No access_token: ${JSON.stringify(data)}`
  );
}

export function attachmentIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType === "application/pdf") return "📄";
  if (mimeType.includes("spreadsheet") || mimeType.includes("csv") || mimeType.includes("excel")) return "📊";
  if (mimeType.includes("wordprocessing") || mimeType.includes("msword")) return "📝";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "📽️";
  if (mimeType.startsWith("text/")) return "📃";
  if (mimeType.includes("zip") || mimeType.includes("compressed")) return "🗜️";
  return "📎";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
