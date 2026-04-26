import { useState, useEffect, useCallback } from "react";
import { fetchCalendarEvents, type CalendarEvent } from "@/lib/calendar";
import { useSettingsStore } from "@/store/settingsStore";

const POLL_INTERVAL = 10 * 60 * 1000;

export function useCalendar() {
  const { gmailToken } = useSettingsStore();
  const [events,         setEvents]         = useState<CalendarEvent[]>([]);
  const [loading,        setLoading]        = useState(false);
  const [noScope,        setNoScope]        = useState(false);

  const refetch = useCallback(async () => {
    if (!gmailToken) return;
    setLoading(true);
    try {
      const evts = await fetchCalendarEvents();
      setEvents(evts);
      setNoScope(false);
    } catch (e) {
      if (e instanceof Error && e.message === "no_calendar_scope") {
        setNoScope(true);
      }
    } finally {
      setLoading(false);
    }
  }, [gmailToken]);

  useEffect(() => {
    if (!gmailToken) return;
    void refetch();
    const id = setInterval(refetch, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [gmailToken, refetch]);

  return { events, loading, noScope, refetch };
}
