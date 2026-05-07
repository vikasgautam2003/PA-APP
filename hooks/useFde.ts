import { useEffect } from "react";
import { useFdeStore } from "@/store/fdeStore";
import { useAuthStore } from "@/store/authStore";
import { getDb } from "@/lib/db";
import { FDE_DAYS, getDay } from "@/lib/fde-roadmap";
import type { FdeDayProgress, FdeProgressRow } from "@/types";

export function isDayComplete(day: number, progress: Record<number, FdeDayProgress>): boolean {
  const meta = getDay(day);
  if (!meta) return false;
  const p = progress[day];
  if (!p) return false;
  if (meta.kind === "rest") return p.taskDone;
  if (meta.kind === "capstone") return p.taskDone && (!meta.dsa || p.dsaDone);
  return p.taskDone && (!meta.dsa || p.dsaDone);
}

export function computeOverallProgress(progress: Record<number, FdeDayProgress>): {
  done: number;
  total: number;
  pct: number;
} {
  const total = FDE_DAYS.length;
  const done = FDE_DAYS.filter((d) => isDayComplete(d.day, progress)).length;
  return { done, total, pct: Math.round((done / total) * 100) };
}

export function findCurrentDay(progress: Record<number, FdeDayProgress>): number {
  for (const d of FDE_DAYS) {
    if (!isDayComplete(d.day, progress)) return d.day;
  }
  return 90;
}

export function useFde() {
  const { user } = useAuthStore();
  const store = useFdeStore();

  useEffect(() => {
    if (user) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function load(): Promise<void> {
    store.setLoading(true);
    try {
      const db = await getDb();
      const rows = await db.select<FdeProgressRow[]>(
        "SELECT * FROM fde_progress WHERE user_id = ?",
        [user!.id]
      );
      const map: Record<number, FdeDayProgress> = {};
      for (const r of rows) {
        map[r.day_number] = {
          day: r.day_number,
          taskDone: !!r.task_done,
          dsaDone: !!r.dsa_done,
          notes: r.notes ?? "",
          completedAt: r.completed_at,
        };
      }
      store.setProgress(map);
      // Pick the first incomplete day on first load only
      if (store.selectedDay === 1) {
        const next = findCurrentDay(map);
        store.setSelectedDay(next);
      }
    } finally {
      store.setLoading(false);
    }
  }

  async function toggleTask(day: number): Promise<void> {
    const current = store.progress[day];
    const nowDone = !(current?.taskDone ?? false);
    await persist(day, { taskDone: nowDone, dsaDone: current?.dsaDone ?? false, notes: current?.notes ?? "" });
  }

  async function toggleDsa(day: number): Promise<void> {
    const current = store.progress[day];
    const nowDone = !(current?.dsaDone ?? false);
    await persist(day, { taskDone: current?.taskDone ?? false, dsaDone: nowDone, notes: current?.notes ?? "" });
  }

  async function saveNotes(day: number, notes: string): Promise<void> {
    const current = store.progress[day];
    await persist(day, { taskDone: current?.taskDone ?? false, dsaDone: current?.dsaDone ?? false, notes });
  }

  async function persist(day: number, next: { taskDone: boolean; dsaDone: boolean; notes: string }): Promise<void> {
    const db = await getDb();
    const meta = getDay(day);
    const fullyDone =
      meta && (meta.kind === "rest"
        ? next.taskDone
        : next.taskDone && (!meta.dsa || next.dsaDone));
    const completedAt = fullyDone ? new Date().toISOString() : null;

    await db.execute(
      `INSERT INTO fde_progress (user_id, day_number, task_done, dsa_done, notes, completed_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id, day_number) DO UPDATE SET
         task_done = excluded.task_done,
         dsa_done = excluded.dsa_done,
         notes = excluded.notes,
         completed_at = excluded.completed_at,
         updated_at = CURRENT_TIMESTAMP`,
      [user!.id, day, next.taskDone ? 1 : 0, next.dsaDone ? 1 : 0, next.notes, completedAt]
    );

    store.upsertProgress({
      day,
      taskDone: next.taskDone,
      dsaDone: next.dsaDone,
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
    toggleDsa,
    saveNotes,
    reload: load,
  };
}
