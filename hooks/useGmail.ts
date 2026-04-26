import { useState, useEffect, useCallback } from "react";
import { fetchMeetingEmails, rankImportantEmails } from "@/lib/gmail";
import { useSettingsStore } from "@/store/settingsStore";
import { useGmailCacheStore } from "@/store/gmailCacheStore";

const TWO_HOURS = 2 * 60 * 60 * 1000;

export function useGmail() {
  const { gmailToken } = useSettingsStore();
  const { emails, lastFetchAt, setCache } = useGmailCacheStore();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const refetch = useCallback(async (force = false) => {
    if (!gmailToken) return;
    const stale = lastFetchAt === null || Date.now() - lastFetchAt >= TWO_HOURS;
    if (!force && !stale) return;

    setLoading(true);
    setError(null);
    try {
      const all  = await fetchMeetingEmails();
      const msgs = await rankImportantEmails(all);
      setCache(msgs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch emails");
    } finally {
      setLoading(false);
    }
  }, [gmailToken, lastFetchAt, setCache]);

  useEffect(() => {
    if (!gmailToken) return;
    void refetch();
    const interval = setInterval(() => void refetch(true), TWO_HOURS);
    return () => clearInterval(interval);
  }, [gmailToken, refetch]);

  return {
    emails,
    loading,
    error,
    lastFetch: lastFetchAt ? new Date(lastFetchAt) : null,
    refetch: () => refetch(true),
  };
}
