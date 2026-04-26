import { useSettingsStore } from "@/store/settingsStore";

const nativeFetch = globalThis.fetch.bind(globalThis);

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1";
const MEETING_KEYWORDS = ["zoom", "meet", "meeting", "invite", "calendar", "call", "standup", "sync"];
const MEETING_LINK_REGEX = /https?:\/\/(zoom\.us\/j|meet\.google\.com|teams\.microsoft\.com)\/[^\s"<>]+/gi;

export interface GmailMessage {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  meetingLinks: string[];
  isRead: boolean;
}

async function refreshAccessToken(): Promise<string | null> {
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
      return retry.json();
    }
    throw new Error("Gmail token expired. Please reconnect.");
  }
  return res.json();
}

export async function fetchMeetingEmails(): Promise<GmailMessage[]> {
  const { gmailToken } = useSettingsStore.getState();
  if (!gmailToken) return [];

  try {
    const query = encodeURIComponent("in:inbox -category:promotions -category:social newer_than:3d");
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

        // still tag meeting emails but don't skip non-meeting ones
        const text = `${subject} ${snippet}`.toLowerCase();
        const isMeetingEmail = MEETING_KEYWORDS.some((kw) => text.includes(kw));

        const meetingLinks: string[] = [];
        function extractLinks(part: unknown) {
          const p = part as { body?: { data?: string }; parts?: unknown[] };
          if (p.body?.data) {
            const decoded = atob(p.body.data.replace(/-/g, "+").replace(/_/g, "/"));
            const found   = decoded.match(MEETING_LINK_REGEX) ?? [];
            meetingLinks.push(...found.map((l) => l.replace(/['"]/g, "")));
          }
          if (p.parts) p.parts.forEach(extractLinks);
        }
        extractLinks(detail.payload);

        const snippetLinks = snippet.match(MEETING_LINK_REGEX) ?? [];
        meetingLinks.push(...snippetLinks);

        const isRead = !detail.labelIds?.includes("UNREAD");

        messages.push({
          id: msg.id,
          subject,
          from: from.replace(/<.*>/, "").trim(),
          date,
          snippet: snippet.slice(0, 120),
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
