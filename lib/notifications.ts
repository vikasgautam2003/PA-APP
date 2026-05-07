// Notification scheduler — runs every 60s from layout
// Uses localStorage to avoid re-firing the same alert within a day

import { getDb } from "./db";

function localDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function send(title: string, body: string) {
  try {
    const { sendNotification, isPermissionGranted, requestPermission } =
      await import("@tauri-apps/plugin-notification");
    let ok = await isPermissionGranted();
    if (!ok) {
      const perm = await requestPermission();
      ok = perm === "granted";
    }
    if (ok) sendNotification({ title, body });
  } catch {}
}

function firedKey(tag: string) {
  return `ares-notif-${tag}-${localDateStr(new Date())}`;
}

function alreadyFired(tag: string) {
  try { return !!localStorage.getItem(firedKey(tag)); } catch { return false; }
}

function markFired(tag: string) {
  try { localStorage.setItem(firedKey(tag), "1"); } catch {}
}

export async function runNotificationTick(opts: {
  userId: number;
  meetingAlert: boolean;
  dsaNudgeTime: string;   // "HH:MM"
  briefTime: string;      // "HH:MM"
  calEvents: Array<{ summary: string; start: string; isAllDay?: boolean }>;
}) {
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const todayStr = localDateStr(now);

  // ── 1. Meeting alert (10 min warning) ───────────────────────────────────
  if (opts.meetingAlert) {
    for (const ev of opts.calEvents) {
      if (ev.isAllDay) continue;
      const start = new Date(ev.start);
      const minsUntil = (start.getTime() - now.getTime()) / 60000;
      if (minsUntil > 9 && minsUntil <= 11) {
        const tag = `meeting-${ev.start}`;
        if (!alreadyFired(tag)) {
          await send("Upcoming meeting", `${ev.summary} starts in ~10 min`);
          markFired(tag);
        }
      }
    }
  }

  // ── 2. DSA nudge ────────────────────────────────────────────────────────
  if (opts.dsaNudgeTime && hhmm === opts.dsaNudgeTime) {
    if (!alreadyFired("dsa-nudge")) {
      try {
        const db = await getDb();
        const rows = await db.select<{ count: number }[]>(
          `SELECT COUNT(*) as count FROM dsa_progress
           WHERE user_id = ? AND status = 'done' AND DATE(solved_at) = ?`,
          [opts.userId, todayStr]
        );
        if ((rows[0]?.count ?? 0) === 0) {
          await send("DSA nudge", "Haven't solved anything today — 1 question keeps the streak alive.");
          markFired("dsa-nudge");
        }
      } catch {}
    }
  }

  // ── 3. Daily brief reminder ─────────────────────────────────────────────
  if (opts.briefTime && hhmm === opts.briefTime) {
    if (!alreadyFired("brief-reminder")) {
      await send("Daily brief ready", "Open Ares to see your AI brief for today.");
      markFired("brief-reminder");
    }
  }
}
