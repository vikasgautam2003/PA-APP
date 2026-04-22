import { useEffect } from "react";
import { usePlannerStore } from "@/store/plannerStore";
import { useAuthStore } from "@/store/authStore";
import { getDb } from "@/lib/db";
import { askGroq } from "@/lib/groq";
import type {
  PlannerTopicWithSubtopics, PlannerSubtopic,
  WeekPlan, DayPlan, DayPlanItem, DifficultyRamp,
} from "@/types";

function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

function getWeekDays(weekStart: string): { date: string; day: string }[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days.map((day, i) => {
    const d = new Date(weekStart + "T00:00:00");
    d.setDate(d.getDate() + i);
    return { date: d.toISOString().split("T")[0], day };
  });
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
      const days = getWeekDays(weekStart);

      // Get DSA context
      const solvedRows = await db.select<{ count: number }[]>(
        "SELECT COUNT(*) as count FROM dsa_progress WHERE user_id = ? AND status = 'done'",
        [user!.id]
      );
      const solved = solvedRows[0]?.count ?? 0;
      const ramp = getDifficultyRamp(solved);

      const topicProgress = await db.select<any[]>(`
        SELECT q.topic,
          COUNT(*) as total,
          SUM(CASE WHEN COALESCE(p.status,'todo')='done' THEN 1 ELSE 0 END) as done
        FROM dsa_questions q
        LEFT JOIN dsa_progress p ON p.question_id = q.id AND p.user_id = ?
        GROUP BY q.topic
      `, [user!.id]);

      const weakTopics = topicProgress
        .filter((t) => t.total > 0 && (t.done / t.total) < 0.2)
        .map((t) => t.topic).slice(0, 5);

      // Pre-select DSA candidates using difficulty ramp
      const candidates = await db.select<any[]>(`
        SELECT q.id, q.title, q.topic, q.difficulty
        FROM dsa_questions q
        LEFT JOIN dsa_progress p ON p.question_id = q.id AND p.user_id = ?
        WHERE COALESCE(p.status, 'todo') = 'todo'
        ORDER BY q.id ASC
        LIMIT 30
      `, [user!.id]);

      const easyPool   = candidates.filter((q) => q.difficulty === "Easy");
      const mediumPool = candidates.filter((q) => q.difficulty === "Medium");
      const hardPool   = candidates.filter((q) => q.difficulty === "Hard");

      const dsaCandidates = [
        ...easyPool.slice(0, Math.round(6 * ramp.easy)),
        ...mediumPool.slice(0, Math.round(6 * ramp.medium)),
        ...hardPool.slice(0, Math.round(6 * ramp.hard)),
      ].slice(0, 6);

      // Build topic queue summary
      const topicQueueSummary = store.topics.map((t, i) => {
        const pendingSubs = t.subtopics.filter((s) => !s.is_done);
        return `${i + 1}. ${t.title}\n${pendingSubs.map((s, j) => `   ${j + 1}. ${s.label}`).join("\n")}`;
      }).join("\n\n");

      const prompt = `You are a study planner for a developer who works 9 hours daily and has ~1.5 hours for studying.

TOPIC QUEUE (in priority order — assign in this order):
${topicQueueSummary || "No custom topics added yet."}

DSA CONTEXT:
- Solved: ${solved}/1000
- Weak topics (prioritize): ${weakTopics.join(", ") || "None yet"}
- DSA candidates for this week (pre-selected, pick 2-3 total across the week):
${dsaCandidates.map((q) => `  [DSA-${q.id}] ${q.title} (${q.topic}, ${q.difficulty})`).join("\n")}

DIFFICULTY RULE: Max 1 Hard question per day. Mix Easy+Medium primarily.

DAYS: Monday to Saturday. Sunday is rest. Max 2-3 items per day.

Return ONLY valid JSON in this exact format:
{
  "week_start": "${weekStart}",
  "days": [
    {
      "date": "YYYY-MM-DD",
      "day": "Mon",
      "items": [
        {"type": "subtopic", "id": <subtopic_id>, "label": "<label>", "topic": "<main topic>"},
        {"type": "dsa", "id": <question_id>, "label": "<title>", "difficulty": "<Easy/Medium/Hard>", "topic": "<topic>"}
      ]
    }
  ]
}

Use actual subtopic IDs from the queue. Assign subtopics in order — do not skip ahead.`;

      const raw = await askGroq(prompt);
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      // Merge with done status
      const allSubtopics = store.topics.flatMap((t) => t.subtopics);
      const plan: WeekPlan = {
        week_start: weekStart,
        generated_at: new Date().toISOString(),
        days: parsed.days.map((d: any) => ({
          date: d.date,
          day: d.day,
          items: d.items.map((item: any) => {
            if (item.type === "subtopic") {
              const sub = allSubtopics.find((s) => s.id === item.id);
              return {
                ...item,
                is_done: sub?.is_done ?? false,
                done_at: sub?.done_at ?? null,
              };
            }
            return { ...item, is_done: false, done_at: null };
          }),
          status: "pending",
        })),
      };

      // Compute statuses
      plan.days = plan.days.map((d) => ({
        ...d,
        status: computeDayStatus(d.items),
      }));

      await db.execute(
        `INSERT INTO planner_week_plans (user_id, week_start, plan_json)
         VALUES (?, ?, ?)
         ON CONFLICT(user_id, week_start) DO UPDATE SET plan_json=excluded.plan_json, generated_at=CURRENT_TIMESTAMP`,
        [user!.id, weekStart, JSON.stringify(plan)]
      );
      store.setCurrentPlan(plan);
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

    if (itemType === "subtopic") {
      await db.execute(
        "UPDATE planner_subtopics SET is_done = 1, done_at = ? WHERE id = ? AND user_id = ?",
        [doneAt, itemId, user!.id]
      );
    } else {
      // First check if the question exists
      const exists = await db.select<{ id: number }[]>(
        "SELECT id FROM dsa_questions WHERE id = ?",
        [itemId]
      );
      if (exists.length > 0) {
        await db.execute(
          `INSERT INTO dsa_progress (user_id, question_id, status, solved_at, updated_at)
           VALUES (?, ?, 'done', ?, CURRENT_TIMESTAMP)
           ON CONFLICT(user_id, question_id) DO UPDATE SET
             status='done', solved_at=excluded.solved_at, updated_at=CURRENT_TIMESTAMP`,
          [user!.id, itemId, doneAt]
        );
      }
    }

    // Update plan in memory + SQLite
    if (!store.currentPlan) return false;
    const updatedPlan: WeekPlan = {
      ...store.currentPlan,
      days: store.currentPlan.days.map((d) => {
        if (d.date !== dayDate) return d;
        const updatedItems = d.items.map((item) =>
          item.id === itemId && item.type === itemType
            ? { ...item, is_done: true, done_at: doneAt }
            : item
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

      const raw   = await askGemini(prompt);
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

  return {
    ...store,
    load,
    addTopic,
    deleteTopic,
    generateWeekPlan,
    deleteWeekPlan,
    improvePlan,
    markItemDone,
  };
}
