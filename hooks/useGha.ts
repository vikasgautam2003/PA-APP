import { useEffect } from "react";
import { useGhaStore } from "@/store/ghaStore";
import { useAuthStore } from "@/store/authStore";
import { getDb } from "@/lib/db";
import { GHA_CHAPTERS, getGhaChapter } from "@/lib/gha-roadmap";
import type { GhaChapterProgress, GhaProgressRow } from "@/types";

export function isGhaChapterComplete(
  chapter: number,
  progress: Record<number, GhaChapterProgress>
): boolean {
  const meta = getGhaChapter(chapter);
  if (!meta) return false;
  const p = progress[chapter];
  return !!p?.done;
}

export function computeGhaOverallProgress(progress: Record<number, GhaChapterProgress>): {
  done: number;
  total: number;
  pct: number;
} {
  const total = GHA_CHAPTERS.length;
  const done = GHA_CHAPTERS.filter((c) => isGhaChapterComplete(c.num, progress)).length;
  return { done, total, pct: Math.round((done / total) * 100) };
}

export function findCurrentGhaChapter(progress: Record<number, GhaChapterProgress>): number {
  for (const c of GHA_CHAPTERS) {
    if (!isGhaChapterComplete(c.num, progress)) return c.num;
  }
  return GHA_CHAPTERS[GHA_CHAPTERS.length - 1].num;
}

export function useGha() {
  const { user } = useAuthStore();
  const store = useGhaStore();

  useEffect(() => {
    if (user) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function load(): Promise<void> {
    store.setLoading(true);
    try {
      const db = await getDb();
      const rows = await db.select<GhaProgressRow[]>(
        "SELECT * FROM gha_progress WHERE user_id = ?",
        [user!.id]
      );
      const map: Record<number, GhaChapterProgress> = {};
      for (const r of rows) {
        map[r.chapter_num] = {
          chapter: r.chapter_num,
          done: !!r.done,
          sectionIndex: r.section_index ?? 0,
          notes: r.notes ?? "",
          completedAt: r.completed_at,
        };
      }
      store.setProgress(map);
      if (store.selectedChapter === 1) {
        const next = findCurrentGhaChapter(map);
        store.setSelectedChapter(next);
      }
    } finally {
      store.setLoading(false);
    }
  }

  async function toggleDone(chapter: number): Promise<void> {
    const current = store.progress[chapter];
    const nowDone = !(current?.done ?? false);
    await persist(chapter, {
      done: nowDone,
      sectionIndex: current?.sectionIndex ?? 0,
      notes: current?.notes ?? "",
    });
  }

  async function setSectionIndex(chapter: number, sectionIndex: number): Promise<void> {
    const current = store.progress[chapter];
    await persist(chapter, {
      done: current?.done ?? false,
      sectionIndex,
      notes: current?.notes ?? "",
    });
  }

  async function saveNotes(chapter: number, notes: string): Promise<void> {
    const current = store.progress[chapter];
    await persist(chapter, {
      done: current?.done ?? false,
      sectionIndex: current?.sectionIndex ?? 0,
      notes,
    });
  }

  async function persist(
    chapter: number,
    next: { done: boolean; sectionIndex: number; notes: string }
  ): Promise<void> {
    const db = await getDb();
    const completedAt = next.done ? new Date().toISOString() : null;

    await db.execute(
      `INSERT INTO gha_progress (user_id, chapter_num, done, section_index, notes, completed_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id, chapter_num) DO UPDATE SET
         done = excluded.done,
         section_index = excluded.section_index,
         notes = excluded.notes,
         completed_at = excluded.completed_at,
         updated_at = CURRENT_TIMESTAMP`,
      [user!.id, chapter, next.done ? 1 : 0, next.sectionIndex, next.notes, completedAt]
    );

    store.upsertProgress({
      chapter,
      done: next.done,
      sectionIndex: next.sectionIndex,
      notes: next.notes,
      completedAt,
    });
  }

  return {
    selectedChapter: store.selectedChapter,
    setSelectedChapter: store.setSelectedChapter,
    progress: store.progress,
    isLoading: store.isLoading,
    toggleDone,
    setSectionIndex,
    saveNotes,
    reload: load,
  };
}
