import { useEffect, useMemo } from "react";
import { useDSAStore } from "@/store/dsaStore";
import { useAuthStore } from "@/store/authStore";
import { getDb } from "@/lib/db";
import type { DSAQuestionWithProgress, TopicProgress, HeatmapEntry } from "@/types";

export function useDSA() {
  const { user } = useAuthStore();
  const store = useDSAStore();

  useEffect(() => {
    if (!user) return;
    loadQuestions();
  }, [user]);

  async function loadQuestions() {
    store.setLoading(true);
    try {
      const db = await getDb();

      const questions = await db.select<DSAQuestionWithProgress[]>(`
        SELECT
          q.id, q.title, q.topic, q.difficulty, q.link, q.notes,
          COALESCE(p.status, 'todo') as status,
          p.user_notes,
          p.solved_at
        FROM dsa_questions q
        LEFT JOIN dsa_progress p
          ON p.question_id = q.id AND p.user_id = ?
        ORDER BY q.id ASC
      `, [user!.id]);

      store.setQuestions(questions);

      // Topic progress
      const topicProgress = await db.select<TopicProgress[]>(`
        SELECT
          q.topic,
          COUNT(*) as total,
          SUM(CASE WHEN COALESCE(p.status,'todo') = 'done' THEN 1 ELSE 0 END) as done,
          SUM(CASE WHEN COALESCE(p.status,'todo') = 'solving' THEN 1 ELSE 0 END) as solving
        FROM dsa_questions q
        LEFT JOIN dsa_progress p ON p.question_id = q.id AND p.user_id = ?
        GROUP BY q.topic
        ORDER BY q.topic ASC
      `, [user!.id]);

      store.setTopicProgress(topicProgress);

      // Heatmap — last 365 days
      const heatmap = await db.select<HeatmapEntry[]>(`
        SELECT date(solved_at) as date, COUNT(*) as count
        FROM dsa_progress
        WHERE user_id = ? AND status = 'done' AND solved_at IS NOT NULL
        GROUP BY date(solved_at)
      `, [user!.id]);

      store.setHeatmap(heatmap);
    } finally {
      store.setLoading(false);
    }
  }

  async function updateStatus(
    questionId: number,
    status: "todo" | "solving" | "done"
  ) {
    if (!user) return;
    const db = await getDb();
    const solvedAt = status === "done" ? new Date().toISOString() : null;

    await db.execute(`
      INSERT INTO dsa_progress (user_id, question_id, status, solved_at, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, question_id)
      DO UPDATE SET status = excluded.status,
                    solved_at = excluded.solved_at,
                    updated_at = CURRENT_TIMESTAMP
    `, [user.id, questionId, status, solvedAt]);

    store.updateQuestionStatus(questionId, status);
  }

  const filtered = useMemo(() => {
    return store.questions.filter((q) => {
      if (store.selectedTopic !== "All" && q.topic !== store.selectedTopic)
        return false;
      if (store.filterDifficulty !== "All" && q.difficulty !== store.filterDifficulty)
        return false;
      if (store.filterStatus !== "All" && q.status !== store.filterStatus)
        return false;
      if (
        store.searchQuery &&
        !q.title.toLowerCase().includes(store.searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [store.questions, store.selectedTopic, store.filterDifficulty, store.filterStatus, store.searchQuery]);

  const totalDone = useMemo(
    () => store.questions.filter((q) => q.status === "done").length,
    [store.questions]
  );

  async function addNote(questionId: number, content: string): Promise<void> {
    const db = await getDb();
    await db.execute(
      "INSERT INTO question_notes (user_id, question_id, content) VALUES (?, ?, ?)",
      [user!.id, questionId, content]
    );
  }

  async function getNotes(questionId: number): Promise<import("@/types").QuestionNote[]> {
    const db = await getDb();
    return db.select(
      "SELECT * FROM question_notes WHERE user_id = ? AND question_id = ? ORDER BY created_at DESC",
      [user!.id, questionId]
    );
  }

  return {
    ...store,
    filtered,
    totalDone,
    updateStatus,
    addNote,
    getNotes,
    reload: loadQuestions,
  };
}