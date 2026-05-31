import { useEffect } from "react";
import { useAieStore } from "@/store/aieStore";
import { useAuthStore } from "@/store/authStore";
import { getDb } from "@/lib/db";
import { AIE_PHASES, getAiePhase } from "@/lib/aie-roadmap";
import type { AiePhaseProgress, AieProgressRow } from "@/types";

export function isAiePhaseComplete(
  phase: number,
  progress: Record<number, AiePhaseProgress>
): boolean {
  const meta = getAiePhase(phase);
  if (!meta) return false;
  const p = progress[phase];
  return !!p?.done;
}

export function computeAieOverallProgress(progress: Record<number, AiePhaseProgress>): {
  done: number;
  total: number;
  pct: number;
} {
  const total = AIE_PHASES.length;
  const done = AIE_PHASES.filter((p) => isAiePhaseComplete(p.num, progress)).length;
  return { done, total, pct: Math.round((done / total) * 100) };
}

export function findCurrentAiePhase(progress: Record<number, AiePhaseProgress>): number {
  for (const p of AIE_PHASES) {
    if (!isAiePhaseComplete(p.num, progress)) return p.num;
  }
  return AIE_PHASES[AIE_PHASES.length - 1].num;
}

export function useAie() {
  const { user } = useAuthStore();
  const store = useAieStore();

  useEffect(() => {
    if (user) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function load(): Promise<void> {
    store.setLoading(true);
    try {
      const db = await getDb();
      const rows = await db.select<AieProgressRow[]>(
        "SELECT * FROM ai_engineer_progress WHERE user_id = ?",
        [user!.id]
      );
      const map: Record<number, AiePhaseProgress> = {};
      for (const r of rows) {
        map[r.phase_num] = {
          phase: r.phase_num,
          done: !!r.done,
          sectionIndex: r.section_index ?? 0,
          notes: r.notes ?? "",
          completedAt: r.completed_at,
        };
      }
      store.setProgress(map);
      if (store.selectedPhase === 1) {
        const next = findCurrentAiePhase(map);
        store.setSelectedPhase(next);
      }
    } finally {
      store.setLoading(false);
    }
  }

  async function toggleDone(phase: number): Promise<void> {
    const current = store.progress[phase];
    const nowDone = !(current?.done ?? false);
    await persist(phase, {
      done: nowDone,
      sectionIndex: current?.sectionIndex ?? 0,
      notes: current?.notes ?? "",
    });
  }

  async function setSectionIndex(phase: number, sectionIndex: number): Promise<void> {
    const current = store.progress[phase];
    await persist(phase, {
      done: current?.done ?? false,
      sectionIndex,
      notes: current?.notes ?? "",
    });
  }

  async function saveNotes(phase: number, notes: string): Promise<void> {
    const current = store.progress[phase];
    await persist(phase, {
      done: current?.done ?? false,
      sectionIndex: current?.sectionIndex ?? 0,
      notes,
    });
  }

  async function persist(
    phase: number,
    next: { done: boolean; sectionIndex: number; notes: string }
  ): Promise<void> {
    const db = await getDb();
    const completedAt = next.done ? new Date().toISOString() : null;

    await db.execute(
      `INSERT INTO ai_engineer_progress (user_id, phase_num, done, section_index, notes, completed_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id, phase_num) DO UPDATE SET
         done = excluded.done,
         section_index = excluded.section_index,
         notes = excluded.notes,
         completed_at = excluded.completed_at,
         updated_at = CURRENT_TIMESTAMP`,
      [user!.id, phase, next.done ? 1 : 0, next.sectionIndex, next.notes, completedAt]
    );

    store.upsertProgress({
      phase,
      done: next.done,
      sectionIndex: next.sectionIndex,
      notes: next.notes,
      completedAt,
    });
  }

  return {
    selectedPhase: store.selectedPhase,
    setSelectedPhase: store.setSelectedPhase,
    progress: store.progress,
    isLoading: store.isLoading,
    toggleDone,
    setSectionIndex,
    saveNotes,
    reload: load,
  };
}
