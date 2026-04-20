import { useEffect, useCallback } from "react";
import { useFinanceStore } from "@/store/financeStore";
import { useAuthStore } from "@/store/authStore";
import { getDb } from "@/lib/db";
import { askGemini } from "@/lib/gemini";
import { calculateSavings } from "@/lib/utils";
import type { FinanceData, ExpenseBreakdown } from "@/types";

const EXPENSE_COLORS = [
  "#2563eb", "#7c3aed", "#db2777", "#d97706",
  "#16a34a", "#0891b2", "#dc2626",
];

const EXPENSE_KEYS: (keyof FinanceData)[] = [
  "rent", "food", "transport", "subscriptions", "misc",
];

const EXPENSE_LABELS: Record<string, string> = {
  rent: "Rent", food: "Food", transport: "Transport",
  subscriptions: "Subscriptions", misc: "Miscellaneous",
};

export function useFinance() {
  const { user } = useAuthStore();
  const store = useFinanceStore();

  useEffect(() => {
    if (user) load();
  }, [user]);

  async function load() {
    store.setLoading(true);
    try {
      const db = await getDb();
      const rows = await db.select<FinanceData[]>(
        "SELECT * FROM finances WHERE user_id = ?",
        [user!.id]
      );
      if (rows.length > 0) {
        const d = rows[0];
        store.setData(d);
        computeProjection(d);
      }
    } finally {
      store.setLoading(false);
    }
  }

  function computeProjection(d: FinanceData) {
    const totalExpenses = EXPENSE_KEYS.reduce(
      (sum, k) => sum + (Number(d[k]) || 0), 0
    );
    const calc = calculateSavings(d.stipend, totalExpenses);
    const monthsToGoal = d.savings_goal > 0 && calc.monthly > 0
      ? Math.ceil(d.savings_goal / calc.monthly)
      : null;

    store.setProjection({ ...calc, monthsToGoal });

    const breakdown: ExpenseBreakdown[] = EXPENSE_KEYS
      .filter((k) => Number(d[k]) > 0)
      .map((k, i) => ({
        label: EXPENSE_LABELS[k],
        amount: Number(d[k]),
        percent: d.stipend > 0 ? Math.round((Number(d[k]) / d.stipend) * 100) : 0,
        color: EXPENSE_COLORS[i % EXPENSE_COLORS.length],
      }));

    store.setBreakdown(breakdown);
  }

  async function save(d: FinanceData) {
    const db = await getDb();
    await db.execute(
      `INSERT INTO finances (user_id, stipend, rent, food, transport, subscriptions, misc, savings_goal, target_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         stipend=excluded.stipend, rent=excluded.rent, food=excluded.food,
         transport=excluded.transport, subscriptions=excluded.subscriptions,
         misc=excluded.misc, savings_goal=excluded.savings_goal,
         target_date=excluded.target_date, updated_at=CURRENT_TIMESTAMP`,
      [user!.id, d.stipend, d.rent, d.food, d.transport,
       d.subscriptions, d.misc, d.savings_goal, d.target_date]
    );
    store.setData(d);
    computeProjection(d);
  }

  async function sendMessage(text: string) {
    const { data, projection } = store;
    store.addMessage({ role: "user", content: text });
    store.setChatLoading(true);

    try {
      const totalExpenses = EXPENSE_KEYS.reduce(
        (sum, k) => sum + (Number(data[k]) || 0), 0
      );

      const context = `You are a personal finance advisor. Here is the user's financial data:
- Monthly Stipend: ₹${data.stipend}
- Rent: ₹${data.rent}
- Food: ₹${data.food}
- Transport: ₹${data.transport}
- Subscriptions: ₹${data.subscriptions}
- Miscellaneous: ₹${data.misc}
- Total Monthly Expenses: ₹${totalExpenses}
- Monthly Savings: ₹${projection?.monthly ?? 0}
- Savings Goal: ₹${data.savings_goal}
- Months to Goal: ${projection?.monthsToGoal ?? "Not set"}

Answer the user's question with specific, actionable advice based on their actual numbers.
Be concise, friendly, and practical. Use ₹ for currency.

User question: ${text}`;

      const reply = await askGemini(context);
      store.addMessage({ role: "assistant", content: reply });
    } catch (e) {
      store.addMessage({
        role: "assistant",
        content: e instanceof Error ? e.message : "Something went wrong. Check your Gemini API key in Settings.",
      });
    } finally {
      store.setChatLoading(false);
    }
  }

  return { ...store, save, sendMessage, reload: load };
}