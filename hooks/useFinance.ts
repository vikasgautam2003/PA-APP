import { useEffect } from "react";
import { useFinanceStore } from "@/store/financeStore";
import { useAuthStore } from "@/store/authStore";
import { getDb } from "@/lib/db";
import { askGemini } from "@/lib/gemini";
import { calculateSavings } from "@/lib/utils";
import type {
  FinanceData, Transaction, TransactionFormData,
  CategorySummary, ScenarioProjection, TransactionCategory,
  MonthlySnapshot,
} from "@/types";

export const CATEGORIES: TransactionCategory[] = [
  "Food", "Transport", "Shopping", "Entertainment",
  "Bills", "Rent", "Health", "Other",
];

export const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  Food:          "#2563eb",
  Transport:     "#7c3aed",
  Shopping:      "#db2777",
  Entertainment: "#d97706",
  Bills:         "#dc2626",
  Rent:          "#0891b2",
  Health:        "#16a34a",
  Other:         "#6b7280",
};

const BUDGET_MAP: Record<TransactionCategory, keyof FinanceData> = {
  Food:          "food",
  Transport:     "transport",
  Shopping:      "misc",
  Entertainment: "misc",
  Bills:         "subscriptions",
  Rent:          "rent",
  Health:        "misc",
  Other:         "misc",
};

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

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
      const data = rows.length > 0 ? rows[0] : store.data;
      if (rows.length > 0) store.setData(data);

      const month = getCurrentMonth();
      const txns = await db.select<Transaction[]>(
        `SELECT * FROM finance_transactions
         WHERE user_id = ? AND strftime('%Y-%m', date) = ?
         ORDER BY date DESC`,
        [user!.id, month]
      );
      store.setTransactions(txns);

      const snaps = await db.select<MonthlySnapshot[]>(
        `SELECT * FROM finance_snapshots WHERE user_id = ? ORDER BY month DESC LIMIT 6`,
        [user!.id]
      );
      store.setSnapshots(snaps);

      computeAll(data, txns);
    } finally {
      store.setLoading(false);
    }
  }

  function computeAll(data: FinanceData, txns: Transaction[]) {
    const budgetExpenses = (["rent","food","transport","subscriptions","misc"] as (keyof FinanceData)[])
      .reduce((sum, k) => sum + (Number(data[k]) || 0), 0);
    const calc = calculateSavings(data.stipend, budgetExpenses);
    const monthsToGoal = data.savings_goal > 0 && calc.monthly > 0
      ? Math.ceil(data.savings_goal / calc.monthly)
      : null;

    store.setProjection({ ...calc, monthsToGoal });

    const spentByCategory: Record<string, number> = {};
    txns.forEach((t) => {
      spentByCategory[t.category] = (spentByCategory[t.category] || 0) + t.amount;
    });

    const summaries: CategorySummary[] = CATEGORIES.map((cat) => {
      const budgetKey = BUDGET_MAP[cat];
      const budgeted = Number(data[budgetKey]) || 0;
      const spent = spentByCategory[cat] || 0;
      const percent = budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0;
      return {
        category: cat,
        budgeted,
        spent,
        percent,
        color: CATEGORY_COLORS[cat],
        transactions: txns.filter((t) => t.category === cat),
      };
    }).filter((s) => s.budgeted > 0 || s.spent > 0);
    store.setCategorySummaries(summaries);

    const totalActualSpent = txns.reduce((s, t) => s + t.amount, 0);
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const dayOfMonth = new Date().getDate();
    const projectedMonthlySpend = dayOfMonth > 0
      ? (totalActualSpent / dayOfMonth) * daysInMonth
      : budgetExpenses;

    const currentActualSavings = data.stipend - projectedMonthlySpend;
    const optimizedSavings = data.stipend - projectedMonthlySpend * 0.85;
    const aggressiveSavings = data.stipend - projectedMonthlySpend * 0.70;

    function monthsTo(savings: number) {
      if (!data.savings_goal || savings <= 0) return null;
      return Math.ceil(data.savings_goal / savings);
    }

    function goalDate(months: number | null) {
      if (!months) return null;
      const d = new Date();
      d.setMonth(d.getMonth() + months);
      return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    }

    const scenarios: ScenarioProjection[] = [
      {
        label: "Pessimistic",
        description: "If current spending pace continues",
        monthlySavings: currentActualSavings,
        monthsToGoal: monthsTo(currentActualSavings),
        goalDate: goalDate(monthsTo(currentActualSavings)),
        color: "#dc2626",
      },
      {
        label: "Realistic",
        description: "Cut 15% from variable expenses",
        monthlySavings: optimizedSavings,
        monthsToGoal: monthsTo(optimizedSavings),
        goalDate: goalDate(monthsTo(optimizedSavings)),
        color: "#d97706",
      },
      {
        label: "Optimistic",
        description: "Cut 30% from variable expenses",
        monthlySavings: aggressiveSavings,
        monthsToGoal: monthsTo(aggressiveSavings),
        goalDate: goalDate(monthsTo(aggressiveSavings)),
        color: "#16a34a",
      },
    ];
    store.setScenarios(scenarios);
  }

  async function saveSettings(d: FinanceData) {
    const db = await getDb();
    await db.execute(
      `INSERT INTO finances (user_id, stipend, rent, food, transport, subscriptions, misc, savings_goal, target_date, currency)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         stipend=excluded.stipend, rent=excluded.rent, food=excluded.food,
         transport=excluded.transport, subscriptions=excluded.subscriptions,
         misc=excluded.misc, savings_goal=excluded.savings_goal,
         target_date=excluded.target_date, currency=excluded.currency,
         updated_at=CURRENT_TIMESTAMP`,
      [user!.id, d.stipend, d.rent, d.food, d.transport,
       d.subscriptions, d.misc, d.savings_goal, d.target_date, d.currency ?? "₹"]
    );
    store.setData(d);
    computeAll(d, store.transactions);
  }

  async function addTransaction(form: TransactionFormData) {
    const db = await getDb();
    await db.execute(
      `INSERT INTO finance_transactions (user_id, amount, category, note, date)
       VALUES (?, ?, ?, ?, ?)`,
      [user!.id, form.amount, form.category, form.note, form.date]
    );
    await load();
  }

  async function deleteTransaction(id: number) {
    const db = await getDb();
    await db.execute(
      "DELETE FROM finance_transactions WHERE id = ? AND user_id = ?",
      [id, user!.id]
    );
    await load();
  }

  async function saveMonthlySnapshot() {
    const db = await getDb();
    const month = getCurrentMonth();
    const totalSpent = store.transactions.reduce((s, t) => s + t.amount, 0);
    const totalSaved = store.data.stipend - totalSpent;
    const byCategory: Record<string, number> = {};
    store.transactions.forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });
    await db.execute(
      `INSERT INTO finance_snapshots (user_id, month, total_spent, total_saved, actual_by_category)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id, month) DO UPDATE SET
         total_spent=excluded.total_spent,
         total_saved=excluded.total_saved,
         actual_by_category=excluded.actual_by_category`,
      [user!.id, month, totalSpent, totalSaved, JSON.stringify(byCategory)]
    );
  }

  async function sendMessage(text: string) {
    const { data, transactions, scenarios, snapshots } = store;
    store.addMessage({ role: "user", content: text });
    store.setChatLoading(true);
    try {
      const totalSpent = transactions.reduce((s, t) => s + t.amount, 0);
      const byCategory = CATEGORIES.map((c) => {
        const spent = transactions.filter((t) => t.category === c).reduce((s, t) => s + t.amount, 0);
        return spent > 0 ? `${c}: ${data.currency}${spent}` : null;
      }).filter(Boolean).join(", ");

      const snapshotContext = snapshots.length > 0
        ? `Last ${snapshots.length} months history: ` +
          snapshots.map((s) => `${s.month}: spent ${data.currency}${s.total_spent}, saved ${data.currency}${s.total_saved}`).join(" | ")
        : "No historical data yet.";

      const context = `You are a personal finance advisor for a developer/student in India.

USER FINANCIAL PROFILE:
- Monthly Stipend: ${data.currency}${data.stipend}
- Budget: Rent ${data.currency}${data.rent}, Food ${data.currency}${data.food}, Transport ${data.currency}${data.transport}, Subscriptions ${data.currency}${data.subscriptions}, Misc ${data.currency}${data.misc}
- Savings Goal: ${data.currency}${data.savings_goal}
- Target Date: ${data.target_date ?? "Not set"}

THIS MONTH SO FAR:
- Total Spent: ${data.currency}${totalSpent}
- By Category: ${byCategory || "No transactions yet"}
- Days into month: ${new Date().getDate()} of ${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()}

SCENARIOS:
- Pessimistic (current pace): saves ${data.currency}${Math.round(scenarios[0]?.monthlySavings ?? 0)}/month, goal in ${scenarios[0]?.monthsToGoal ?? "?"} months
- Realistic (cut 15%): saves ${data.currency}${Math.round(scenarios[1]?.monthlySavings ?? 0)}/month, goal in ${scenarios[1]?.monthsToGoal ?? "?"} months
- Optimistic (cut 30%): saves ${data.currency}${Math.round(scenarios[2]?.monthlySavings ?? 0)}/month, goal in ${scenarios[2]?.monthsToGoal ?? "?"} months

HISTORICAL TRENDS:
${snapshotContext}

Give specific, actionable advice based on actual numbers. Be concise and direct. Use ${data.currency} for amounts.

User: ${text}`;

      const reply = await askGemini(context);
      store.addMessage({ role: "assistant", content: reply });
    } catch (e) {
      store.addMessage({
        role: "assistant",
        content: e instanceof Error ? e.message : "Check your Gemini API key in Settings.",
      });
    } finally {
      store.setChatLoading(false);
    }
  }

  return {
    ...store,
    saveSettings,
    addTransaction,
    deleteTransaction,
    saveMonthlySnapshot,
    sendMessage,
    reload: load,
  };
}
