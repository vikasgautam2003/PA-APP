// Notification scheduler — runs every 60s from the dashboard.
// Uses localStorage to avoid re-firing the same alert within a day.
//   • Motivation briefs at ~02:00 and ~06:00 (today's planned course work)
//   • Course-work reminders every ~3h during the day (pending items only)
//   • Meeting alerts (10-min warning) from the calendar

import { getDb } from "./db";
import { loadCoursePlan, todayItems } from "./course-plan";
import type { CoursePlanItem } from "@/types";

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

function itemLine(i: CoursePlanItem): string {
  return `${i.short} · ${i.label}`;
}

// Hours at which to nudge about pending course work (~every 3h, waking hours).
const REMINDER_HOURS = [9, 12, 15, 18, 21];

export async function runNotificationTick(opts: {
  userId: number;
  meetingAlert: boolean;
  calEvents: Array<{ summary: string; start: string; isAllDay?: boolean }>;
}) {
  const now = new Date();
  const hour = now.getHours();

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

  // Today's planned course work (shared by motivation + reminders)
  let items: CoursePlanItem[] = [];
  try {
    const db = await getDb();
    const plan = await loadCoursePlan(db, opts.userId);
    items = todayItems(plan);
  } catch { /* no plan / db not ready */ }

  const pending = items.filter((i) => !i.is_done);

  // ── 2. Motivation briefs at ~02:00 and ~06:00 ───────────────────────────
  for (const slot of [2, 6]) {
    if (hour === slot && !alreadyFired(`motivation-${slot}`)) {
      if (items.length > 0) {
        const focus = items.map(itemLine).join("  •  ");
        await send(
          `Today's focus — ${items.length} ${items.length === 1 ? "block" : "blocks"}`,
          `${focus}.  Two deliberate sessions and you move a full day closer to shipping. Start with the first — momentum does the rest.`
        );
      } else {
        await send(
          "Plan your day",
          "No course work scheduled today. Open the Planner and lay out the week — consistent, compounding progress beats cramming."
        );
      }
      markFired(`motivation-${slot}`);
    }
  }

  // ── 3. Course-work reminders every ~3h (only if something's pending) ─────
  if (REMINDER_HOURS.includes(hour) && pending.length > 0) {
    const tag = `course-reminder-${hour}`;
    if (!alreadyFired(tag)) {
      const list = pending.map(itemLine).join("  •  ");
      await send(
        `Still on deck — ${pending.length} ${pending.length === 1 ? "item" : "items"}`,
        `${list}.  Knock one out now; future-you will thank present-you.`
      );
      markFired(tag);
    }
  }
}
