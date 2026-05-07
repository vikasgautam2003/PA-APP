import { useEffect } from "react";
import { usePlannerStore } from "@/store/plannerStore";
import { useAuthStore } from "@/store/authStore";
import { getDb } from "@/lib/db";
import { askGroq } from "@/lib/groq";
import type {
  PlannerTopicWithSubtopics, PlannerSubtopic,
  WeekPlan, DayPlan, DayPlanItem, DifficultyRamp, QuickSession, QuickSessionDSA,
} from "@/types";

function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return localDateStr(d);
}

function getDifficultyRamp(solved: number): DifficultyRamp {
  if (solved < 100) return { easy: 0.70, medium: 0.20, hard: 0.10 };
  if (solved < 300) return { easy: 0.50, medium: 0.35, hard: 0.15 };
  if (solved < 600) return { easy: 0.40, medium: 0.40, hard: 0.20 };
  return { easy: 0.30, medium: 0.40, hard: 0.30 };
}

function computeDayStatus(items: DayPlanItem[]): DayPlan["status"] {
  if (items.length === 0) return "pending";
  const done = items.filter((i) => i.is_done).length;
  const total = items.length;
  if (done === total) return "green";
  if (done >= Math.ceil(total / 2)) return "amber";
  if (done === 0) return "pending";
  return "red";
}

export function usePlanner() {
  const { user } = useAuthStore();
  const store = usePlannerStore();

  useEffect(() => {
    if (user) load();
  }, [user]);

  async function load() {
    store.setLoading(true);
    try {
      const db = await getDb();

      // Load topics with subtopics
      const topics = await db.select<any[]>(
        "SELECT * FROM planner_topics WHERE user_id = ? ORDER BY order_index ASC",
        [user!.id]
      );
      const topicsWithSubs: PlannerTopicWithSubtopics[] = await Promise.all(
        topics.map(async (t) => {
          const subs = await db.select<PlannerSubtopic[]>(
            "SELECT * FROM planner_subtopics WHERE topic_id = ? ORDER BY order_index ASC",
            [t.id]
          );
          return { ...t, subtopics: subs };
        })
      );
      store.setTopics(topicsWithSubs);

      // Load current week plan
      const weekStart = getWeekStart();
      const plans = await db.select<any[]>(
        "SELECT * FROM planner_week_plans WHERE user_id = ? AND week_start = ?",
        [user!.id, weekStart]
      );
      if (plans.length > 0) {
        const plan = JSON.parse(plans[0].plan_json) as WeekPlan;
        store.setCurrentPlan(plan);
      } else {
        store.setCurrentPlan(null);
      }
    } finally {
      store.setLoading(false);
    }
  }

  async function addTopic(title: string, subtopicsRaw: string): Promise<void> {
    const db = await getDb();
    const maxOrder = store.topics.length;

    const result = await db.execute(
      "INSERT INTO planner_topics (user_id, title, order_index) VALUES (?, ?, ?)",
      [user!.id, title.trim(), maxOrder]
    );
    const topicId = result.lastInsertId;

    // Parse subtopics — handle "HH:MM:SS Label" format
    const lines = subtopicsRaw.split("\n").filter((l) => l.trim());
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const tsMatch = line.match(/^(\d{1,2}:\d{2}:\d{2})\s+(.+)$/);
      if (tsMatch) {
        await db.execute(
          "INSERT INTO planner_subtopics (topic_id, user_id, label, timestamp_raw, order_index) VALUES (?, ?, ?, ?, ?)",
          [topicId, user!.id, tsMatch[2].trim(), tsMatch[1], i]
        );
      } else if (line) {
        await db.execute(
          "INSERT INTO planner_subtopics (topic_id, user_id, label, timestamp_raw, order_index) VALUES (?, ?, ?, ?, ?)",
          [topicId, user!.id, line, "", i]
        );
      }
    }
    await load();
  }

  async function deleteTopic(topicId: number): Promise<void> {
    const db = await getDb();
    await db.execute("DELETE FROM planner_subtopics WHERE topic_id = ?", [topicId]);
    await db.execute("DELETE FROM planner_topics WHERE id = ? AND user_id = ?", [topicId, user!.id]);
    await load();
  }

  async function generateWeekPlan(): Promise<void> {
    store.setGenerating(true);
    try {
      const db = await getDb();
      const weekStart = getWeekStart();

      // Solved count → difficulty ramp
      const solvedRows = await db.select<{ count: number }[]>(
        "SELECT COUNT(*) as count FROM dsa_progress WHERE user_id = ? AND status = 'done'",
        [user!.id]
      );
      const solved = solvedRows[0]?.count ?? 0;
      const ramp = getDifficultyRamp(solved);

      // Need 12 DSA questions total: 2 per day × 6 work days (Mon–Sat)
      const TOTAL_DSA   = 12;
      const easyTarget  = Math.round(TOTAL_DSA * ramp.easy);
      const mediumTarget = Math.round(TOTAL_DSA * ramp.medium);
      const hardTarget  = Math.max(0, TOTAL_DSA - easyTarget - mediumTarget);

      const [easyQ, mediumQ, hardQ] = await Promise.all([
        db.select<any[]>(
          `SELECT q.id, q.title, q.topic, q.difficulty
           FROM dsa_questions q
           LEFT JOIN dsa_progress p ON p.question_id = q.id AND p.user_id = ?
           WHERE COALESCE(p.status,'todo') = 'todo' AND q.difficulty = 'Easy'
           ORDER BY RANDOM() LIMIT ?`,
          [user!.id, easyTarget + 4]
        ),
        db.select<any[]>(
          `SELECT q.id, q.title, q.topic, q.difficulty
           FROM dsa_questions q
           LEFT JOIN dsa_progress p ON p.question_id = q.id AND p.user_id = ?
           WHERE COALESCE(p.status,'todo') = 'todo' AND q.difficulty = 'Medium'
           ORDER BY RANDOM() LIMIT ?`,
          [user!.id, mediumTarget + 2]
        ),
        hardTarget > 0
          ? db.select<any[]>(
              `SELECT q.id, q.title, q.topic, q.difficulty
               FROM dsa_questions q
               LEFT JOIN dsa_progress p ON p.question_id = q.id AND p.user_id = ?
               WHERE COALESCE(p.status,'todo') = 'todo' AND q.difficulty = 'Hard'
               ORDER BY RANDOM() LIMIT ?`,
              [user!.id, hardTarget]
            )
          : Promise.resolve([]),
      ]);

      let dsaPool: any[] = [
        ...easyQ.slice(0, easyTarget),
        ...mediumQ.slice(0, mediumTarget),
        ...hardQ.slice(0, hardTarget),
      ];

      // Fill gaps if any difficulty bucket was short
      if (dsaPool.length < TOTAL_DSA) {
        const usedIds = dsaPool.map((q) => q.id);
        const inClause = usedIds.length > 0
          ? `AND q.id NOT IN (${usedIds.map(() => "?").join(",")})`
          : "";
        const extra = await db.select<any[]>(
          `SELECT q.id, q.title, q.topic, q.difficulty
           FROM dsa_questions q
           LEFT JOIN dsa_progress p ON p.question_id = q.id AND p.user_id = ?
           WHERE COALESCE(p.status,'todo') = 'todo' ${inClause}
           ORDER BY q.difficulty ASC, RANDOM() LIMIT ?`,
          [user!.id, ...usedIds, TOTAL_DSA - dsaPool.length]
        );
        dsaPool = [...dsaPool, ...extra];
      }

      // Pending subtopics in queue order — 1 per work day
      const pendingSubs = store.topics.flatMap((t) =>
        t.subtopics.filter((s) => !s.is_done).map((s) => ({ ...s, topicTitle: t.title }))
      );

      // Build Mon–Sun
      const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const startDate = new Date(weekStart + "T00:00:00");

      const days: DayPlan[] = DAY_NAMES.map((dayName, i) => {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        const dateStr = localDateStr(d);

        // Sunday = rest
        if (i === 6) return { date: dateStr, day: dayName, items: [], status: "rest" as const };

        const items: DayPlanItem[] = [];

        // 2 DSA questions
        const q1 = dsaPool[i * 2];
        const q2 = dsaPool[i * 2 + 1];
        if (q1) items.push({ type: "dsa", id: q1.id, label: q1.title, difficulty: q1.difficulty, topic: q1.topic, is_done: false, done_at: null });
        if (q2) items.push({ type: "dsa", id: q2.id, label: q2.title, difficulty: q2.difficulty, topic: q2.topic, is_done: false, done_at: null });

        // 1 topic subtask
        const sub = pendingSubs[i];
        if (sub) items.push({ type: "subtopic", id: sub.id, label: sub.label, topic: sub.topicTitle, is_done: sub.is_done, done_at: sub.done_at });

        return { date: dateStr, day: dayName, items, status: computeDayStatus(items) };
      });

      const plan: WeekPlan = {
        week_start: weekStart,
        generated_at: new Date().toISOString(),
        days,
      };

      await db.execute(
        `INSERT INTO planner_week_plans (user_id, week_start, plan_json)
         VALUES (?, ?, ?)
         ON CONFLICT(user_id, week_start) DO UPDATE SET plan_json=excluded.plan_json, generated_at=CURRENT_TIMESTAMP`,
        [user!.id, weekStart, JSON.stringify(plan)]
      );
      store.setCurrentPlan(plan);
    } catch (err) {
      console.error("[generateWeekPlan] failed:", err);
      throw err;
    } finally {
      store.setGenerating(false);
    }
  }

  async function markItemDone(
    dayDate: string,
    itemId: number,
    itemType: "subtopic" | "dsa"
  ): Promise<boolean> {
    const db = await getDb();
    const doneAt = new Date().toISOString();

    // Find current state
    const currentPlan = store.currentPlan;
    if (!currentPlan) return false;

    const currentDay = currentPlan.days.find((d) => d.date === dayDate);
    const item = currentDay?.items.find((i) => i.id === itemId && i.type === itemType);
    if (!item) return false;

    const nowDone = !item.is_done;

    if (itemType === "subtopic") {
      await db.execute(
        "UPDATE planner_subtopics SET is_done = ?, done_at = ? WHERE id = ? AND user_id = ?",
        [nowDone ? 1 : 0, nowDone ? doneAt : null, itemId, user!.id]
      );
    } else {
      const exists = await db.select<{ id: number }[]>(
        "SELECT id FROM dsa_questions WHERE id = ?",
        [itemId]
      );
      if (exists.length > 0) {
        await db.execute(
          `INSERT INTO dsa_progress (user_id, question_id, status, solved_at, updated_at)
           VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
           ON CONFLICT(user_id, question_id) DO UPDATE SET
             status=excluded.status, solved_at=excluded.solved_at, updated_at=CURRENT_TIMESTAMP`,
          [user!.id, itemId, nowDone ? "done" : "todo", nowDone ? doneAt : null]
        );
      }
    }

    // Update plan in memory + SQLite
    const updatedPlan: WeekPlan = {
      ...currentPlan,
      days: currentPlan.days.map((d) => {
        if (d.date !== dayDate) return d;
        const updatedItems = d.items.map((i) =>
          i.id === itemId && i.type === itemType
            ? { ...i, is_done: nowDone, done_at: nowDone ? doneAt : null }
            : i
        );
        return { ...d, items: updatedItems, status: computeDayStatus(updatedItems) };
      }),
    };

    await db.execute(
      `UPDATE planner_week_plans SET plan_json = ? WHERE user_id = ? AND week_start = ?`,
      [JSON.stringify(updatedPlan), user!.id, updatedPlan.week_start]
    );
    store.setCurrentPlan(updatedPlan);

    // Check if day is now complete
    const day = updatedPlan.days.find((d) => d.date === dayDate);
    const dayComplete = day?.status === "green";
    if (dayComplete) store.setCelebratingDay(dayDate);
    return dayComplete;
  }

  async function deleteWeekPlan(): Promise<void> {
    const db = await getDb();
    const weekStart = getWeekStart();
    await db.execute(
      "DELETE FROM planner_week_plans WHERE user_id = ? AND week_start = ?",
      [user!.id, weekStart]
    );
    store.setCurrentPlan(null);
  }

  async function improvePlan(instruction: string): Promise<void> {
    if (!store.currentPlan) return;
    store.setGenerating(true);
    try {
      const planSummary = store.currentPlan.days.map((d) => {
        const items = d.items.map((i) => `    - [${i.is_done ? "DONE" : "TODO"}] ${i.label} (${i.type}${i.difficulty ? ", " + i.difficulty : ""})`).join("\n");
        return `${d.day} (${d.date}):\n${items || "    - No tasks"}`;
      }).join("\n\n");

      const prompt = `You are a study planner. Here is the user's CURRENT weekly plan:

${planSummary}

The user wants to modify this plan with the following instruction:
"${instruction}"

Rules:
- Keep tasks that are already marked DONE exactly where they are
- Only reschedule TODO tasks
- Max 2-3 items per day
- Sunday is always rest
- Keep the same JSON format

Return ONLY valid JSON in this exact format:
{
  "week_start": "${store.currentPlan.week_start}",
  "days": [
    {
      "date": "YYYY-MM-DD",
      "day": "Mon",
      "items": [
        {"type": "subtopic", "id": <id>, "label": "<label>", "topic": "<topic>", "is_done": false, "done_at": null},
        {"type": "dsa", "id": <id>, "label": "<label>", "difficulty": "<Easy/Medium/Hard>", "topic": "<topic>", "is_done": false, "done_at": null}
      ]
    }
  ]
}`;

      const raw   = await askGroq(prompt);
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      const db = await getDb();
      const updatedPlan: WeekPlan = {
        week_start:    store.currentPlan.week_start,
        generated_at:  new Date().toISOString(),
        days: parsed.days.map((d: any) => ({
          ...d,
          status: computeDayStatus(d.items),
        })),
      };

      await db.execute(
        `UPDATE planner_week_plans SET plan_json = ?, generated_at = CURRENT_TIMESTAMP
         WHERE user_id = ? AND week_start = ?`,
        [JSON.stringify(updatedPlan), user!.id, updatedPlan.week_start]
      );
      store.setCurrentPlan(updatedPlan);
    } finally {
      store.setGenerating(false);
    }
  }

  async function getQuickSession(rawInput: string): Promise<void> {
    store.setSessionLoading(true);
    try {
      const db = await getDb();

      // Parse topic and optional difficulty from the input
      const DIFF_WORDS: Record<string, string> = {
        easy: "Easy", medium: "Medium", hard: "Hard",
        e: "Easy", m: "Medium", h: "Hard",
      };
      const tokens = rawInput.trim().toLowerCase().split(/[\s·\-,]+/);
      let difficulty = "";
      const topicTokens: string[] = [];
      for (const t of tokens) {
        if (DIFF_WORDS[t]) difficulty = DIFF_WORDS[t];
        else if (t) topicTokens.push(t);
      }
      const topic = topicTokens.join(" ");

      // Check whether the topic actually exists in the DSA tracker
      const existsRows = topic
        ? await db.select<{ count: number }[]>(
            "SELECT COUNT(*) as count FROM dsa_questions WHERE LOWER(topic) LIKE ?",
            [`%${topic}%`]
          )
        : [{ count: 0 }];
      const topicInTracker = (existsRows[0]?.count ?? 0) > 0;

      let dsaTasks: QuickSessionDSA[] = [];
      let aiGenerated = false;

      if (topicInTracker && topic) {
        // Pull up to 2 unsolved questions from the tracker
        const rows = await db.select<any[]>(
          `SELECT q.id, q.title, q.topic, q.difficulty
           FROM dsa_questions q
           LEFT JOIN dsa_progress p ON p.question_id = q.id AND p.user_id = ?
           WHERE COALESCE(p.status, 'todo') = 'todo'
             AND LOWER(q.topic) LIKE ?
             ${difficulty ? "AND q.difficulty = ?" : ""}
           ORDER BY RANDOM() LIMIT 2`,
          difficulty
            ? [user!.id, `%${topic}%`, difficulty]
            : [user!.id, `%${topic}%`]
        );
        dsaTasks = rows.map((q) => ({ id: q.id, label: q.title, topic: q.topic, difficulty: q.difficulty }));
      }

      // Fill any gap (topic not in tracker, or not enough questions) with AI
      if (dsaTasks.length < 2) {
        aiGenerated = true;
        const needed = 2 - dsaTasks.length;
        const already = dsaTasks.map((t) => t.label).join(", ");
        const raw = await askGroq(
          `You are an expert DSA trainer. Generate ${needed} well-known coding interview question(s) for a beginner practising "${topic || "general DSA"}" at "${difficulty || "Medium"}" difficulty.
${already ? `Already assigned: ${already}. Choose different ones.` : ""}
Pick popular, classic problems (LeetCode/interview style). Phrase them as a trainer giving exercises to a student.
Return ONLY valid JSON: {"questions":[{"label":"...","topic":"...","difficulty":"..."}]}`
        );
        const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim()) as { questions: { label: string; topic: string; difficulty: string }[] };
        const aiQ = parsed.questions.slice(0, needed).map((q, i) => ({
          id: -(i + 1),
          label: q.label,
          topic: q.topic || topic || "General",
          difficulty: q.difficulty || difficulty || "Medium",
        }));
        dsaTasks = [...dsaTasks, ...aiQ];
      }

      // Get 1 pending topic task from the planner queue
      const pending = store.topics
        .flatMap((t) => t.subtopics.filter((s) => !s.is_done).map((s) => ({ label: s.label, topic: t.title })));
      const topicTask = pending[0] ?? { label: "Review your notes and plan for tomorrow", topic: "General" };

      store.setQuickSession({
        topic: rawInput,
        difficulty: difficulty || "Mixed",
        dsa_tasks: dsaTasks.slice(0, 2),
        topic_task: topicTask,
        ai_generated: aiGenerated,
      });
    } catch {
      store.setQuickSession({
        topic: rawInput,
        difficulty: "",
        dsa_tasks: [
          { id: 0, label: "Could not load questions — try again", topic: "", difficulty: "" },
          { id: 0, label: "Check your DSA tracker has data seeded", topic: "", difficulty: "" },
        ],
        topic_task: { label: "Review pending tasks from your queue", topic: "General" },
        ai_generated: false,
      });
    } finally {
      store.setSessionLoading(false);
    }
  }

  return {
    ...store,
    load,
    addTopic,
    deleteTopic,
    generateWeekPlan,
    deleteWeekPlan,
    improvePlan,
    markItemDone,
    getQuickSession,
  };
}
