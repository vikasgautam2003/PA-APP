// Course registry — a unified abstraction over every Learning Hub course so the
// planner can read progress, pick the next incomplete units, and mark them done
// without caring about each course's individual table/shape.

import type Database from "@tauri-apps/plugin-sql";
import type { CourseId } from "@/components/learning-hub/courses";
import { AWS_DAYS } from "@/lib/aws-roadmap";
import { SYSDES_PHASES } from "@/lib/sysdes-roadmap";
import { AIE_PHASES } from "@/lib/aie-roadmap";
import { GHA_CHAPTERS } from "@/lib/gha-roadmap";
import { GIT_CHAPTERS } from "@/lib/git-roadmap";

export interface CourseUnit {
  num: number;
  label: string;     // human label, e.g. "Day 6 · VPC Networking"
}

export interface PlannerCourse {
  id: CourseId;
  short: string;       // "AWS"
  label: string;       // "AWS Solutions Architect"
  unitNoun: string;    // "day" | "chapter" | "phase"
  table: string;       // progress table name
  unitCol: string;     // unit column in that table
  /** column that marks completion: "task_done" for AWS, "done" for the rest */
  doneCol: string;
  units: CourseUnit[];
}

function awsUnits(): CourseUnit[] {
  return AWS_DAYS.map((d) => ({
    num: d.day,
    label: `Day ${d.day}${d.topic ? ` · ${d.topic}` : ""}`,
  }));
}

function phaseUnits(phases: { num: number; phaseLabel: string; title: string }[]): CourseUnit[] {
  return phases.map((p) => ({ num: p.num, label: `${p.phaseLabel} · ${p.title}` }));
}

function chapterUnits(chapters: { num: number; title: string }[]): CourseUnit[] {
  return chapters.map((c) => ({ num: c.num, label: `Ch ${String(c.num).padStart(2, "0")} · ${c.title}` }));
}

// Priority order — the planner activates the first two incomplete courses.
// "Start with AWS and System Design" → those lead the list.
export const PLANNER_COURSES: PlannerCourse[] = [
  {
    id: "aws", short: "AWS", label: "AWS Solutions Architect",
    unitNoun: "day", table: "aws_progress", unitCol: "day_number", doneCol: "task_done",
    units: awsUnits(),
  },
  {
    id: "system-design", short: "System Design", label: "System Design Master Roadmap",
    unitNoun: "chapter", table: "system_design_progress", unitCol: "phase_num", doneCol: "done",
    units: phaseUnits(SYSDES_PHASES),
  },
  {
    id: "ai-engineer", short: "AI Engineer", label: "AI Engineer Master Roadmap",
    unitNoun: "phase", table: "ai_engineer_progress", unitCol: "phase_num", doneCol: "done",
    units: phaseUnits(AIE_PHASES),
  },
  {
    id: "github-actions", short: "GitHub Actions", label: "GitHub Actions — Expert Pipelines",
    unitNoun: "chapter", table: "gha_progress", unitCol: "chapter_num", doneCol: "done",
    units: chapterUnits(GHA_CHAPTERS),
  },
  {
    id: "git-github", short: "Git & GitHub", label: "Git & GitHub — Company Ready",
    unitNoun: "chapter", table: "git_progress", unitCol: "chapter_num", doneCol: "done",
    units: chapterUnits(GIT_CHAPTERS),
  },
];

export function getPlannerCourse(id: CourseId): PlannerCourse | undefined {
  return PLANNER_COURSES.find((c) => c.id === id);
}

/** Set of completed unit numbers for one course. */
export async function loadDoneUnits(
  db: Database, course: PlannerCourse, userId: number
): Promise<Set<number>> {
  const rows = await db.select<Record<string, number>[]>(
    `SELECT ${course.unitCol} AS num, ${course.doneCol} AS done FROM ${course.table} WHERE user_id = ?`,
    [userId]
  );
  const done = new Set<number>();
  for (const r of rows) {
    if (r.done) done.add(r.num);
  }
  return done;
}

export function courseDoneCount(course: PlannerCourse, done: Set<number>): number {
  return course.units.filter((u) => done.has(u.num)).length;
}

export function isCourseComplete(course: PlannerCourse, done: Set<number>): boolean {
  return courseDoneCount(course, done) >= course.units.length;
}

/** Next `count` units (in order) that aren't done yet. */
export function nextIncompleteUnits(course: PlannerCourse, done: Set<number>, count: number): CourseUnit[] {
  const out: CourseUnit[] = [];
  for (const u of course.units) {
    if (!done.has(u.num)) out.push(u);
    if (out.length >= count) break;
  }
  return out;
}

/** Mark one course unit done in its own progress table (best-effort write-through). */
export async function markCourseUnitDone(
  db: Database, course: PlannerCourse, userId: number, num: number, done: boolean
): Promise<void> {
  const completedAt = done ? new Date().toISOString() : null;
  // Every course progress table shares the same column set besides the unit col
  // and done col, so an explicit per-table upsert keeps types honest.
  await db.execute(
    `INSERT INTO ${course.table} (user_id, ${course.unitCol}, ${course.doneCol}, section_index, notes, completed_at, updated_at)
     VALUES (?, ?, ?, 0, '', ?, CURRENT_TIMESTAMP)
     ON CONFLICT(user_id, ${course.unitCol}) DO UPDATE SET
       ${course.doneCol} = excluded.${course.doneCol},
       completed_at = excluded.completed_at,
       updated_at = CURRENT_TIMESTAMP`,
    [userId, num, done ? 1 : 0, completedAt]
  );
}

/** The two courses the planner should currently focus on (first two incomplete). */
export async function activeCourses(
  db: Database, userId: number
): Promise<{ course: PlannerCourse; done: Set<number> }[]> {
  const all = await Promise.all(
    PLANNER_COURSES.map(async (course) => ({ course, done: await loadDoneUnits(db, course, userId) }))
  );
  const incomplete = all.filter(({ course, done }) => !isCourseComplete(course, done));
  // If everything is complete, fall back to the first two so the UI still renders.
  return (incomplete.length > 0 ? incomplete : all).slice(0, 2);
}
