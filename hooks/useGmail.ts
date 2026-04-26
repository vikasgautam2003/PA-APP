import { useState, useEffect, useCallback } from "react";
import { fetchMeetingEmails, type GmailMessage } from "@/lib/gmail";
import { useSettingsStore } from "@/store/settingsStore";

const POLL_INTERVAL = 5 * 60 * 1000;

export function useGmail() {
  const { gmailToken } = useSettingsStore();
  const [emails,    setEmails]    = useState<GmailMessage[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const refetch = useCallback(async () => {
    if (!gmailToken) return;
    setLoading(true);
    setError(null);
    try {
      const msgs = await fetchMeetingEmails();
      setEmails(msgs);
      setLastFetch(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch emails");
    } finally {
      setLoading(false);
    }
  }, [gmailToken]);

  useEffect(() => {
    if (!gmailToken) return;
    void refetch();
    const interval = setInterval(refetch, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [gmailToken, refetch]);

  return { emails, loading, error, lastFetch, refetch };
}
