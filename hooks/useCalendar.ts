import { useEffect, useCallback } from "react";
import { fetchCalendarEvents } from "@/lib/calendar";
import { useSettingsStore } from "@/store/settingsStore";
import { useCalendarCacheStore } from "@/store/calendarCacheStore";

const CACHE_TTL    = 60 * 60 * 1000; // 1 hour
const POLL_INTERVAL = 60 * 60 * 1000; // re-check every hour

export function useCalendar() {
  const { gmailToken } = useSettingsStore();
  const { events, lastFetchAt, setCache } = useCalendarCacheStore();
  const loading = useCalendarCacheStore((s) => s.lastFetchAt === null && s.events.length === 0);
  const noScope = useCalendarCacheStore((s) => (s as { _noScope?: boolean })._noScope ?? false);

  const refetch = useCallback(async (force = false) => {
    if (!gmailToken) return;

    // Use cache if fresh enough and not forcing
    if (!force && lastFetchAt !== null && Date.now() - lastFetchAt < CACHE_TTL) return;

    try {
      const evts = await fetchCalendarEvents();
      setCache(evts);
      useCalendarCacheStore.setState({ _noScope: false } as never);
    } catch (e) {
      if (e instanceof Error && e.message === "no_calendar_scope") {
        useCalendarCacheStore.setState({ _noScope: true } as never);
      }
    }
  }, [gmailToken, lastFetchAt, setCache]);

  useEffect(() => {
    if (!gmailToken) return;
    void refetch();
    const id = setInterval(() => refetch(), POLL_INTERVAL);
    return () => clearInterval(id);
  }, [gmailToken, refetch]);

  return {
    events,
    loading,
    noScope,
    refetch: () => refetch(true), // force-refresh when called manually
  };
}
