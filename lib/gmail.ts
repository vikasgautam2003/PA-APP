import { useSettingsStore } from "@/store/settingsStore";
import { askGroq } from "@/lib/groq";

const nativeFetch = globalThis.fetch.bind(globalThis);

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1";
const MEETING_LINK_REGEX = /https?:\/\/(?:[a-z0-9-]+\.)?zoom\.us\/j\/[^\s"<>]+|https?:\/\/meet\.google\.com\/[^\s"<>]+|https?:\/\/teams\.microsoft\.com\/[^\s"<>]+/gi;

export interface GmailMessage {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  body: string;
  meetingLinks: string[];
  isRead: boolean;
}

export async function refreshAccessToken(): Promise<string | null> {
  const { gmailRefreshToken, gmailClientId, gmailClientSecret, setGmailTokens } = useSettingsStore.getState();
  if (!gmailRefreshToken || !gmailClientId || !gmailClientSecret) return null;

  try {
    const res = await nativeFetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id:     gmailClientId,
        client_secret: gmailClientSecret,
        refresh_token: gmailRefreshToken,
        grant_type:    "refresh_token",
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
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      const retry = await nativeFetch(`${GMAIL_API}${endpoint}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${newToken}` },
      });
      if (!retry.ok) throw new Error(`Gmail API ${retry.status}`);
      return retry.json();
    }
    throw new Error("Gmail token expired. Please reconnect.");
  }
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({})) as Record<string, unknown>;
    const msg = (errBody.error as Record<string, unknown>)?.message ?? `Gmail API ${res.status}`;
    throw new Error(msg as string);
  }
  return res.json();
}

export async function fetchMeetingEmails(): Promise<GmailMessage[]> {
  const { gmailToken } = useSettingsStore.getState();
  if (!gmailToken) return [];

  try {
    const query = encodeURIComponent("in:inbox newer_than:7d");
    const list  = await gmailFetch(`/users/me/messages?q=${query}&maxResults=20`, gmailToken) as { messages?: { id: string }[] };
    if (!list.messages?.length) return [];

    const messages: GmailMessage[] = [];

    for (const msg of list.messages.slice(0, 10)) {
      try {
        const detail = await gmailFetch(`/users/me/messages/${msg.id}?format=full`, gmailToken) as {
          payload?: { headers?: { name: string; value: string }[]; parts?: unknown[]; body?: { data?: string } };
          snippet?: string;
          labelIds?: string[];
        };
        const headers = detail.payload?.headers ?? [];

        const subject = headers.find((h) => h.name === "Subject")?.value ?? "(No subject)";
        const from    = headers.find((h) => h.name === "From")?.value ?? "Unknown";
        const date    = headers.find((h) => h.name === "Date")?.value ?? "";
        const snippet = detail.snippet ?? "";

        const meetingLinks: string[] = [];
        let bodyText = "";
        function decodeBase64Utf8(b64: string): string {
          const binary = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
          const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
          return new TextDecoder("utf-8").decode(bytes);
        }

        function extractParts(part: unknown) {
          const p = part as { mimeType?: string; body?: { data?: string }; parts?: unknown[] };
          if (p.body?.data) {
            const decoded = decodeBase64Utf8(p.body.data);
            const found   = decoded.match(MEETING_LINK_REGEX) ?? [];
            meetingLinks.push(...found.map((l) => l.replace(/['"]/g, "")));
            if (p.mimeType === "text/plain" && !bodyText) {
              bodyText = decoded;
            }
          }
          if (p.parts) p.parts.forEach(extractParts);
        }
        extractParts(detail.payload);

        if (!bodyText && detail.payload?.body?.data) {
          const decoded = decodeBase64Utf8(detail.payload.body.data);
          bodyText = decoded.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        }

        const snippetLinks = snippet.match(MEETING_LINK_REGEX) ?? [];
        meetingLinks.push(...snippetLinks);

        const isRead = !detail.labelIds?.includes("UNREAD");

        messages.push({
          id: msg.id,
          subject,
          from: from.replace(/<[^>]*>/, "").replace(/^["'\s]+|["'\s]+$/g, "").trim(),
          date,
          snippet: snippet.slice(0, 120),
          body: bodyText.slice(0, 800),
          meetingLinks: [...new Set(meetingLinks)],
          isRead,
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

  const list = emails
    .map((e, i) => `${i}. from="${e.from}" subject="${e.subject}"`)
    .join("\n");

  try {
    const raw = await askGroq(
      `Here are emails from an inbox:\n${list}\n\nPick the top 4 most important/urgent ones for a busy professional. Prioritise: action required, meetings, messages from real people, deadlines. Deprioritise: automated reports, AI summaries, newsletters, system notifications.\nReturn JSON: {"indexes":[n,n,n,n]}`,
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
    client_id:     clientId,
    redirect_uri:  `http://localhost:${port}`,
    response_type: "code",
    scope:         [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/calendar.readonly",
    ].join(" "),
    access_type:   "offline",
    prompt:        "consent",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string,
  clientId: string,
  clientSecret: string,
  port: number
): Promise<{ access_token: string; refresh_token: string } | null> {
  const body = new URLSearchParams({
    code,
    client_id:     clientId,
    client_secret: clientSecret,
    redirect_uri:  `http://localhost:${port}`,
    grant_type:    "authorization_code",
  }).toString();

  // Use native globalThis.fetch — Google's token endpoint doesn't need CORS bypass
  const res = await globalThis.fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = await res.json() as Record<string, unknown>;
  console.log("[gmail] token exchange response:", JSON.stringify(data));

  if (typeof data.access_token === "string") {
    return {
      access_token:  data.access_token,
      refresh_token: typeof data.refresh_token === "string" ? data.refresh_token : "",
    };
  }

  throw new Error(
    typeof data.error_description === "string"
      ? data.error_description
      : typeof data.error === "string"
        ? `Google error: ${data.error}`
        : `No access_token in response: ${JSON.stringify(data)}`
  );
}
