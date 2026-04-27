import { useSettingsStore } from "@/store/settingsStore";

const CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const nativeFetch  = globalThis.fetch.bind(globalThis);
const MEET_REGEX   = /https?:\/\/(zoom\.us\/j\/?\S+|meet\.google\.com\/[a-z-]+|teams\.microsoft\.com\/l\/meetup-join\/\S+)/gi;

export interface CalendarEvent {
  id:           string;
  summary:      string;
  start:        string;
  end:          string;
  isAllDay:     boolean;
  meetingLinks: string[];
  location:     string;
  description:  string;
  attendeeCount: number;
  isNow:        boolean;
  isSoon:       boolean;
}

export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  const { gmailToken } = useSettingsStore.getState();
  if (!gmailToken) return [];

  const now      = new Date();
  const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    timeMin:       now.toISOString(),
    timeMax:       weekAhead.toISOString(),
    singleEvents:  "true",
    orderBy:       "startTime",
    maxResults:    "20",
  });

  const res = await nativeFetch(
    `${CALENDAR_API}/calendars/primary/events?${params.toString()}`,
    { headers: { Authorization: `Bearer ${gmailToken}` } }
  );

  if (res.status === 401) throw new Error("Calendar token expired. Please reconnect Gmail.");
  if (res.status === 403) throw new Error("no_calendar_scope");
  if (!res.ok)            throw new Error(`Calendar API ${res.status}`);

  const data = await res.json() as { items?: Record<string, unknown>[] };
  const events: CalendarEvent[] = [];

  for (const item of (data.items ?? [])) {
    const i = item as Record<string, unknown>;
    const isAllDay  = !(i.start as Record<string,string>)?.dateTime;
    const startStr  = (i.start as Record<string,string>)?.dateTime ?? (i.start as Record<string,string>)?.date ?? "";
    const endStr    = (i.end   as Record<string,string>)?.dateTime ?? (i.end   as Record<string,string>)?.date ?? "";
    const desc      = (i.description as string) ?? "";
    const location  = (i.location    as string) ?? "";
    const hangout   = (i.hangoutLink as string) ?? "";

    const confData  = i.conferenceData as { entryPoints?: { entryPointType?: string; uri?: string }[] } | undefined;
    const confLinks = (confData?.entryPoints ?? [])
      .filter((ep) => ep.entryPointType === "video")
      .map((ep) => ep.uri ?? "")
      .filter(Boolean);

    const allText   = `${desc} ${location} ${hangout}`;
    const rawLinks  = [
      ...(allText.match(MEET_REGEX) ?? []),
      ...(hangout ? [hangout] : []),
      ...confLinks,
    ];
    // Normalize to base URL (strip query params) before deduplication
    const links = [...new Set(
      rawLinks.map((l) => { try { const u = new URL(l); return u.origin + u.pathname; } catch { return l; } })
    )];

    const startDate = new Date(startStr);
    const endDate   = new Date(endStr);
    const msUntil   = startDate.getTime() - now.getTime();

    events.push({
      id:            i.id as string,
      summary:       (i.summary as string) ?? "(No title)",
      start:         startStr,
      end:           endStr,
      isAllDay,
      meetingLinks:  links,
      location:      location.slice(0, 80),
      description:   desc.slice(0, 600),
      attendeeCount: (i.attendees as unknown[])?.length ?? 0,
      isNow:  !isAllDay && now >= startDate && now < endDate,
      isSoon: !isAllDay && msUntil > 0 && msUntil < 30 * 60 * 1000,
    });
  }

  return events;
}
