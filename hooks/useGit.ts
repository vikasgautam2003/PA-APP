import { useEffect } from "react";
import { useGitStore } from "@/store/gitStore";
import { useAuthStore } from "@/store/authStore";
import { getDb } from "@/lib/db";
import { GIT_CHAPTERS, getGitChapter } from "@/lib/git-roadmap";
import type { GitChapterProgress, GitProgressRow } from "@/types";

export function isGitChapterComplete(
  chapter: number,
  progress: Record<number, GitChapterProgress>
): boolean {
  const meta = getGitChapter(chapter);
  if (!meta) return false;
  const p = progress[chapter];
  return !!p?.done;
}

export function computeGitOverallProgress(progress: Record<number, GitChapterProgress>): {
  done: number;
  total: number;
  pct: number;
} {
  const total = GIT_CHAPTERS.length;
  const done = GIT_CHAPTERS.filter((c) => isGitChapterComplete(c.num, progress)).length;
  return { done, total, pct: Math.round((done / total) * 100) };
}

export function findCurrentGitChapter(progress: Record<number, GitChapterProgress>): number {
  for (const c of GIT_CHAPTERS) {
    if (!isGitChapterComplete(c.num, progress)) return c.num;
  }
  return GIT_CHAPTERS[GIT_CHAPTERS.length - 1].num;
}

export function useGit() {
  const { user } = useAuthStore();
  const store = useGitStore();

  useEffect(() => {
    if (user) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function load(): Promise<void> {
    store.setLoading(true);
    try {
      const db = await getDb();
      const rows = await db.select<GitProgressRow[]>(
        "SELECT * FROM git_progress WHERE user_id = ?",
        [user!.id]
      );
      const map: Record<number, GitChapterProgress> = {};
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
        const next = findCurrentGitChapter(map);
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
      `INSERT INTO git_progress (user_id, chapter_num, done, section_index, notes, completed_at, updated_at)
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
