import { useEffect } from "react";
import { useAwsStore } from "@/store/awsStore";
import { useAuthStore } from "@/store/authStore";
import { getDb } from "@/lib/db";
import { AWS_DAYS, getAwsDay } from "@/lib/aws-roadmap";
import type { AwsDayProgress, AwsProgressRow } from "@/types";

export function isAwsDayComplete(day: number, progress: Record<number, AwsDayProgress>): boolean {
  const meta = getAwsDay(day);
  if (!meta) return false;
  const p = progress[day];
  if (!p) return false;
  return p.taskDone;
}

export function computeAwsOverallProgress(progress: Record<number, AwsDayProgress>): {
  done: number;
  total: number;
  pct: number;
} {
  const total = AWS_DAYS.length;
  const done = AWS_DAYS.filter((d) => isAwsDayComplete(d.day, progress)).length;
  return { done, total, pct: Math.round((done / total) * 100) };
}

export function findCurrentAwsDay(progress: Record<number, AwsDayProgress>): number {
  for (const d of AWS_DAYS) {
    if (!isAwsDayComplete(d.day, progress)) return d.day;
  }
  return 90;
}

export function useAws() {
  const { user } = useAuthStore();
  const store = useAwsStore();

  useEffect(() => {
    if (user) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function load(): Promise<void> {
    store.setLoading(true);
    try {
      const db = await getDb();
      const rows = await db.select<AwsProgressRow[]>(
        "SELECT * FROM aws_progress WHERE user_id = ?",
        [user!.id]
      );
      const map: Record<number, AwsDayProgress> = {};
      for (const r of rows) {
        map[r.day_number] = {
          day: r.day_number,
          taskDone: !!r.task_done,
          sectionIndex: r.section_index ?? 0,
          notes: r.notes ?? "",
          completedAt: r.completed_at,
        };
      }
      store.setProgress(map);
      if (store.selectedDay === 1) {
        const next = findCurrentAwsDay(map);
        store.setSelectedDay(next);
      }
    } finally {
      store.setLoading(false);
    }
  }

  async function toggleTask(day: number): Promise<void> {
    const current = store.progress[day];
    const nowDone = !(current?.taskDone ?? false);
    await persist(day, {
      taskDone: nowDone,
      sectionIndex: current?.sectionIndex ?? 0,
      notes: current?.notes ?? "",
    });
  }

  async function setSectionIndex(day: number, sectionIndex: number): Promise<void> {
    const current = store.progress[day];
    await persist(day, {
      taskDone: current?.taskDone ?? false,
      sectionIndex,
      notes: current?.notes ?? "",
    });
  }

  async function saveNotes(day: number, notes: string): Promise<void> {
    const current = store.progress[day];
    await persist(day, {
      taskDone: current?.taskDone ?? false,
      sectionIndex: current?.sectionIndex ?? 0,
      notes,
    });
  }

  async function persist(
    day: number,
    next: { taskDone: boolean; sectionIndex: number; notes: string }
  ): Promise<void> {
    const db = await getDb();
    const completedAt = next.taskDone ? new Date().toISOString() : null;

    await db.execute(
      `INSERT INTO aws_progress (user_id, day_number, task_done, section_index, notes, completed_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id, day_number) DO UPDATE SET
         task_done = excluded.task_done,
         section_index = excluded.section_index,
         notes = excluded.notes,
         completed_at = excluded.completed_at,
         updated_at = CURRENT_TIMESTAMP`,
      [user!.id, day, next.taskDone ? 1 : 0, next.sectionIndex, next.notes, completedAt]
    );

    store.upsertProgress({
      day,
      taskDone: next.taskDone,
      sectionIndex: next.sectionIndex,
      notes: next.notes,
      completedAt,
    });
  }

  return {
    selectedDay: store.selectedDay,
    setSelectedDay: store.setSelectedDay,
    progress: store.progress,
    isLoading: store.isLoading,
    toggleTask,
    setSectionIndex,
    saveNotes,
    reload: load,
  };
}
