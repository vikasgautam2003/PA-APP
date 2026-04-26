import { useEffect, useMemo } from "react";
import { useFinanceStore } from "@/store/financeStore";
import { useAuthStore } from "@/store/authStore";
import { getDb } from "@/lib/db";
import { askGroqChat } from "@/lib/groq";
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
        "SELECT * FROM finances WHERE user_id = ?", [user!.id]
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
      ? Math.ceil(data.savings_goal / calc.monthly) : null;
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
        category: cat, budgeted, spent, percent,
        color: CATEGORY_COLORS[cat],
        transactions: txns.filter((t) => t.category === cat),
      };
    }).filter((s) => s.budgeted > 0 || s.spent > 0);
    store.setCategorySummaries(summaries);

    const totalSpent = txns.reduce((s, t) => s + t.amount, 0);
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const dayOfMonth = new Date().getDate();
    const projectedMonthlySpend = dayOfMonth > 0
      ? (totalSpent / dayOfMonth) * daysInMonth : budgetExpenses;

    const currentSavings = data.stipend - projectedMonthlySpend;
    const optimizedSavings = data.stipend - projectedMonthlySpend * 0.85;
    const aggressiveSavings = data.stipend - projectedMonthlySpend * 0.70;

    function monthsTo(s: number) {
      if (!data.savings_goal || s <= 0) return null;
      return Math.ceil(data.savings_goal / s);
    }
    function goalDate(m: number | null) {
      if (!m) return null;
      const d = new Date(); d.setMonth(d.getMonth() + m);
      return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    }

    store.setScenarios([
      { label: "Current Pace", description: "If you keep spending like now", monthlySavings: currentSavings, monthsToGoal: monthsTo(currentSavings), goalDate: goalDate(monthsTo(currentSavings)), color: currentSavings < 0 ? "#dc2626" : "#d97706" },
      { label: "Cut 15%",     description: "Trim variable expenses by 15%",  monthlySavings: optimizedSavings, monthsToGoal: monthsTo(optimizedSavings), goalDate: goalDate(monthsTo(optimizedSavings)), color: "#d97706" },
      { label: "Cut 30%",     description: "Aggressive 30% reduction",        monthlySavings: aggressiveSavings, monthsToGoal: monthsTo(aggressiveSavings), goalDate: goalDate(monthsTo(aggressiveSavings)), color: "#16a34a" },
    ]);
  }

  // ── Daily allowance (with rollover) ──────────────────────────────────────
  const dailyStats = useMemo(() => {
    const { data, transactions } = store;
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const dayOfMonth = today.getDate();
    const daysRemaining = daysInMonth - dayOfMonth + 1;

    // Free cash after fixed costs (rent + savings_goal)
    const monthlyFreeCash = Math.max(0, data.stipend - data.rent - data.savings_goal);
    const dailyBudget = monthlyFreeCash / daysInMonth;

    const spentBeforeToday = transactions
      .filter((t) => t.date < todayStr)
      .reduce((s, t) => s + t.amount, 0);
    const spentToday = transactions
      .filter((t) => t.date === todayStr)
      .reduce((s, t) => s + t.amount, 0);

    const expectedByYesterday = dailyBudget * (dayOfMonth - 1);
    const rollover = expectedByYesterday - spentBeforeToday;
    const todayAllowance = dailyBudget + Math.max(0, rollover); // never add deficit here
    const remainingToday = todayAllowance - spentToday;
    const totalSpentThisMonth = transactions.reduce((s, t) => s + t.amount, 0);
    const projectedMonthSpend = dayOfMonth > 0
      ? (totalSpentThisMonth / dayOfMonth) * daysInMonth : 0;
    const projectedMonthlySavings = data.stipend - data.rent - projectedMonthSpend;

    return {
      dailyBudget, todayAllowance, remainingToday,
      spentToday, rollover: Math.max(0, rollover),
      totalSpentThisMonth, projectedMonthSpend, projectedMonthlySavings,
      daysInMonth, dayOfMonth, daysRemaining,
      monthlyFreeCash,
    };
  }, [store.data, store.transactions]);

  // ── Budget warnings ───────────────────────────────────────────────────────
  const budgetWarnings = useMemo(() => {
    const { dayOfMonth, daysInMonth } = dailyStats;
    const monthPct = dayOfMonth / daysInMonth;
    return store.categorySummaries.filter((s) => {
      if (s.budgeted === 0) return false;
      const budgetPct = s.spent / s.budgeted;
      return budgetPct > 0.70 && monthPct < 0.70; // overpacing
    });
  }, [store.categorySummaries, dailyStats]);

  // ── Expense impact ────────────────────────────────────────────────────────
  function calcExpenseImpact(amount: number) {
    const { data, scenarios } = store;
    const monthlySavings = scenarios[0]?.monthlySavings ?? 0;
    if (!data.savings_goal || monthlySavings <= 0) return null;
    const monthsToGoal = Math.ceil(data.savings_goal / monthlySavings);
    const monthsRemaining = Math.max(1, monthsToGoal);
    const extraPerMonth = amount / monthsRemaining;
    const goalDelayMonths = amount / monthlySavings;
    return { extraPerMonth, goalDelayMonths: Math.round(goalDelayMonths * 10) / 10 };
  }

  // ── Persistence ───────────────────────────────────────────────────────────
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

  async function sendMessage(text: string) {
    const { data, transactions, scenarios, snapshots } = store;
    store.addMessage({ role: "user", content: text });
    store.setChatLoading(true);
    try {
      const { totalSpentThisMonth, projectedMonthlySavings, dailyBudget, remainingToday } = dailyStats;
      const byCategory = CATEGORIES.map((c) => {
        const spent = transactions.filter((t) => t.category === c).reduce((s, t) => s + t.amount, 0);
        return spent > 0 ? `${c}: ${data.currency}${spent}` : null;
      }).filter(Boolean).join(", ");
      const snapshotCtx = snapshots.length > 0
        ? snapshots.map((s) => `${s.month}: spent ${data.currency}${s.total_spent}, saved ${data.currency}${s.total_saved}`).join(" | ")
        : "No history yet.";

      const system = `You are a friendly but firm personal finance guru named "Guru" for a developer named ${user?.username}.
You have a warm, witty personality — like a smart friend who knows finance deeply.
Never be generic. Use real numbers. Reference specific categories. Be concise (max 3 sentences).

USER FINANCES:
- Monthly stipend: ${data.currency}${data.stipend}
- Fixed costs: Rent ${data.currency}${data.rent}
- Budgets: Food ${data.currency}${data.food}, Transport ${data.currency}${data.transport}, Subscriptions ${data.currency}${data.subscriptions}, Misc ${data.currency}${data.misc}
- Savings goal: ${data.currency}${data.savings_goal} by ${data.target_date ?? "no target date"}

THIS MONTH (day ${dailyStats.dayOfMonth} of ${dailyStats.daysInMonth}):
- Total spent: ${data.currency}${Math.round(totalSpentThisMonth)}
- By category: ${byCategory || "nothing yet"}
- Daily allowance: ${data.currency}${Math.round(dailyBudget)}/day
- Remaining today: ${data.currency}${Math.round(remainingToday)}
- Projected monthly savings: ${data.currency}${Math.round(projectedMonthlySavings)}

SCENARIO AT CURRENT PACE: goal in ${scenarios[0]?.monthsToGoal ?? "?"} months (${scenarios[0]?.goalDate ?? "unknown"})
HISTORY: ${snapshotCtx}`;

      const reply = await askGroqChat(
        store.messages.map((m) => ({ role: m.role, content: m.content })),
        system
      );
      store.addMessage({ role: "assistant", content: reply });
    } catch (e) {
      store.addMessage({
        role: "assistant",
        content: e instanceof Error ? e.message : "Check your Groq key in Settings.",
      });
    } finally {
      store.setChatLoading(false);
    }
  }

  return {
    ...store,
    ...dailyStats,
    budgetWarnings,
    calcExpenseImpact,
    saveSettings,
    addTransaction,
    deleteTransaction,
    sendMessage,
    reload: load,
  };
}
