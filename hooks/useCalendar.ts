import { useEffect, useCallback, useState } from "react";
import { fetchCalendarEvents } from "@/lib/calendar";
import { useSettingsStore } from "@/store/settingsStore";
import { useCalendarCacheStore } from "@/store/calendarCacheStore";

const CACHE_TTL    = 60 * 60 * 1000;
const POLL_INTERVAL = 60 * 60 * 1000;

export function useCalendar() {
  const { gmailToken } = useSettingsStore();
  const { events, lastFetchAt, setCache } = useCalendarCacheStore();
  const loading = useCalendarCacheStore((s) => s.lastFetchAt === null && s.events.length === 0);
  const noScope = useCalendarCacheStore((s) => (s as { _noScope?: boolean })._noScope ?? false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refetch = useCallback(async (force = false) => {
    if (!gmailToken) return;
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

  const manualRefetch = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  return {
    events,
    loading,
    noScope,
    isRefreshing,
    refetch: manualRefetch,
  };
}
