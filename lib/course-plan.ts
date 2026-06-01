// Pure (React-free) logic for the course-driven weekly planner.
// Shared by useCoursePlanner (UI) and the notification scheduler.

import type Database from "@tauri-apps/plugin-sql";
import type { CourseWeekPlan, CourseDayPlan, CoursePlanItem } from "@/types";
import {
  type PlannerCourse, nextIncompleteUnits,
} from "@/lib/courses-registry";

export function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Monday of the current week (ISO-style, Mon-start). */
export function getWeekStart(base = new Date()): string {
  const d = new Date(base);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return localDateStr(d);
}

export function computeDayStatus(items: CoursePlanItem[]): CourseDayPlan["status"] {
  if (items.length === 0) return "pending";
  const done = items.filter((i) => i.is_done).length;
  if (done === items.length) return "green";
  if (done === 0) return "pending";
  if (done >= Math.ceil(items.length / 2)) return "amber";
  return "red";
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WORK_DAYS = 6; // Mon–Sat, Sun rests

/**
 * Build a meticulous week plan: each work day gets the next incomplete unit
 * from each of the two active courses (sequential, no repeats), Sunday rests.
 */
export function buildWeekPlan(
  active: { course: PlannerCourse; done: Set<number> }[],
  weekStart: string
): CourseWeekPlan {
  // Per-course queue of the next units for the week (one per work day).
  const queues = active.map(({ course, done }) => ({
    course,
    units: nextIncompleteUnits(course, done, WORK_DAYS),
  }));

  const startDate = new Date(weekStart + "T00:00:00");
  const days: CourseDayPlan[] = DAY_NAMES.map((dayName, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = localDateStr(d);

    if (i >= WORK_DAYS) {
      return { date: dateStr, day: dayName, items: [], status: "rest" };
    }

    const items: CoursePlanItem[] = [];
    for (const q of queues) {
      const unit = q.units[i];
      if (unit) {
        items.push({
          courseId: q.course.id,
          short: q.course.short,
          unitNum: unit.num,
          label: unit.label,
          is_done: false,
        });
      }
    }
    return { date: dateStr, day: dayName, items, status: computeDayStatus(items) };
  });

  return {
    week_start: weekStart,
    course_ids: active.map((a) => a.course.id),
    days,
    generated_at: new Date().toISOString(),
  };
}

export async function loadCoursePlan(
  db: Database, userId: number, weekStart = getWeekStart()
): Promise<CourseWeekPlan | null> {
  const rows = await db.select<{ plan_json: string }[]>(
    "SELECT plan_json FROM planner_course_plans WHERE user_id = ? AND week_start = ?",
    [userId, weekStart]
  );
  if (rows.length === 0) return null;
  try {
    return JSON.parse(rows[0].plan_json) as CourseWeekPlan;
  } catch {
    return null;
  }
}

export async function saveCoursePlan(db: Database, userId: number, plan: CourseWeekPlan): Promise<void> {
  await db.execute(
    `INSERT INTO planner_course_plans (user_id, week_start, plan_json, generated_at)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(user_id, week_start) DO UPDATE SET
       plan_json = excluded.plan_json, generated_at = CURRENT_TIMESTAMP`,
    [userId, plan.week_start, JSON.stringify(plan)]
  );
}

/** Today's plan items (or [] if no plan / rest day). */
export function todayItems(plan: CourseWeekPlan | null): CoursePlanItem[] {
  if (!plan) return [];
  const today = localDateStr(new Date());
  return plan.days.find((d) => d.date === today)?.items ?? [];
}
