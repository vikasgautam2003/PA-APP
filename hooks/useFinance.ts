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

function parseFixedCategories(raw: unknown): TransactionCategory[] {
  if (Array.isArray(raw)) return raw as TransactionCategory[];
  if (typeof raw === "string" && raw.length > 0) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as TransactionCategory[]) : ["Rent"];
    } catch { return ["Rent"]; }
  }
  return ["Rent"];
}

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

function computeYearGoalMonthlyTarget(data: FinanceData, snapshots: MonthlySnapshot[]): number {
  if (!data.year_goal || data.year_goal <= 0) return 0;
  const now = new Date();
  const year = now.getFullYear();
  const monthIdx = now.getMonth();
  const monthsRemaining = 12 - monthIdx; // includes current month
  if (monthsRemaining <= 0) return 0;
  const yearPrefix = String(year);
  const saved = snapshots
    .filter((s) => s.month.startsWith(yearPrefix))
    .reduce((sum, s) => sum + (Number(s.total_saved) || 0), 0);
  return Math.max(0, (data.year_goal - saved) / monthsRemaining);
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
      const raw = rows.length > 0 ? rows[0] : store.data;
      const rawSource = (raw as FinanceData).preferred_savings_source;
      const data: FinanceData = {
        ...raw,
        fixed_categories: parseFixedCategories((raw as FinanceData).fixed_categories),
        year_goal: Number((raw as FinanceData).year_goal) || 0,
        monthly_savings_target: Number((raw as FinanceData).monthly_savings_target) || 0,
        preferred_savings_source: rawSource === "year" ? "year" : "monthly",
      };
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
        `SELECT * FROM finance_snapshots WHERE user_id = ? ORDER BY month DESC LIMIT 24`,
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

    const fixedSet = new Set(data.fixed_categories ?? ["Rent"]);
    const variableSpent = txns
      .filter((t) => !fixedSet.has(t.category))
      .reduce((s, t) => s + t.amount, 0);
    const variableBudget = (["food", "transport", "subscriptions", "misc"] as (keyof FinanceData)[])
      .reduce((sum, k) => sum + (Number(data[k]) || 0), 0);
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const dayOfMonth = new Date().getDate();
    const projectedVariableSpend = dayOfMonth > 0
      ? (variableSpent / dayOfMonth) * daysInMonth : variableBudget;

    const currentSavings    = data.stipend - data.rent - projectedVariableSpend;
    const optimizedSavings  = data.stipend - data.rent - projectedVariableSpend * 0.85;
    const aggressiveSavings = data.stipend - data.rent - projectedVariableSpend * 0.70;

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

    // Variable transactions = all transactions except those in user-marked fixed categories.
    // Fixed categories (e.g. Rent) are necessities; their spend is already accounted for via
    // settings (data.rent) and shouldn't shrink the daily/variable allowance or savings projection.
    const fixedSet = new Set(data.fixed_categories ?? ["Rent"]);
    const variableTxns = transactions.filter((t) => !fixedSet.has(t.category));

    // Effective monthly savings target. When both year goal and an explicit monthly target
    // are configured, `preferred_savings_source` decides which one drives the math. When only
    // one is configured, it wins automatically.
    const yearGoalMonthly = computeYearGoalMonthlyTarget(data, store.snapshots);
    const monthlyConfigured = data.monthly_savings_target > 0;
    const yearConfigured    = yearGoalMonthly > 0;
    const useMonthly = monthlyConfigured && yearConfigured
      ? data.preferred_savings_source === "monthly"
      : monthlyConfigured;
    const effectiveMonthlySavings = useMonthly
      ? data.monthly_savings_target
      : yearConfigured ? yearGoalMonthly : 0;
    const savingsSource: "monthly" | "year" | "none" =
      useMonthly ? "monthly" : yearConfigured ? "year" : "none";
    const monthlyFreeCash = Math.max(0, data.stipend - data.rent - effectiveMonthlySavings);
    const dailyBudget = monthlyFreeCash / daysInMonth;

    const spentBeforeToday = variableTxns
      .filter((t) => t.date < todayStr)
      .reduce((s, t) => s + t.amount, 0);
    const spentToday = variableTxns
      .filter((t) => t.date === todayStr)
      .reduce((s, t) => s + t.amount, 0);

    const expectedByYesterday = dailyBudget * (dayOfMonth - 1);
    const rollover = expectedByYesterday - spentBeforeToday;
    const todayAllowance = dailyBudget + Math.max(0, rollover); // never add deficit here
    const remainingToday = todayAllowance - spentToday;
    const totalSpentThisMonth = variableTxns.reduce((s, t) => s + t.amount, 0);
    const projectedMonthSpend = dayOfMonth > 0
      ? (totalSpentThisMonth / dayOfMonth) * daysInMonth : 0;
    const projectedMonthlySavings = data.stipend - data.rent - projectedMonthSpend;

    return {
      dailyBudget, todayAllowance, remainingToday,
      spentToday, rollover: Math.max(0, rollover),
      totalSpentThisMonth, projectedMonthSpend, projectedMonthlySavings,
      daysInMonth, dayOfMonth, daysRemaining,
      monthlyFreeCash,
      effectiveMonthlySavings, savingsSource,
    };
  }, [store.data, store.transactions, store.snapshots]);

  // ── Year savings goal stats ───────────────────────────────────────────────
  const yearStats = useMemo(() => {
    const { data, snapshots, transactions } = store;
    const today = new Date();
    const year = today.getFullYear();
    const monthIdx = today.getMonth(); // 0–11
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
    const daysInYear = ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 366 : 365;
    const startOfYear = new Date(year, 0, 1).getTime();
    const dayOfYear = Math.floor((today.getTime() - startOfYear) / 86_400_000) + 1;
    const daysLeftInYear = daysInYear - dayOfYear + 1;
    const monthsRemaining = 12 - monthIdx; // includes current month

    const yearPrefix = String(year);
    const savedFromSnapshots = snapshots
      .filter((s) => s.month.startsWith(yearPrefix))
      .reduce((sum, s) => sum + (Number(s.total_saved) || 0), 0);

    // Estimate current month savings if not yet snapshotted: stipend - all transactions this month.
    const currentMonthKey = `${year}-${String(monthIdx + 1).padStart(2, "0")}`;
    const currentMonthSnapshotted = snapshots.some((s) => s.month === currentMonthKey);
    const currentMonthSpent = transactions.reduce((s, t) => s + t.amount, 0);
    const currentMonthSavedEstimate = data.stipend - currentMonthSpent;
    const savedSoFar = savedFromSnapshots + (currentMonthSnapshotted ? 0 : currentMonthSavedEstimate);

    const remaining = Math.max(0, (data.year_goal || 0) - savedSoFar);
    const requiredMonthly = monthsRemaining > 0 ? remaining / monthsRemaining : 0;
    const monthlyVariableBudget = Math.max(0, data.stipend - data.rent - requiredMonthly);
    const dailyVariable = monthlyVariableBudget / daysInMonth;
    const weeklyVariable = dailyVariable * 7;
    const progress = data.year_goal > 0 ? Math.min(1, savedSoFar / data.year_goal) : 0;
    const onPace = requiredMonthly <= Math.max(0, data.stipend - data.rent);

    return {
      year, savedSoFar, savedFromSnapshots, currentMonthSavedEstimate, currentMonthSnapshotted,
      remaining, requiredMonthly, monthlyVariableBudget, dailyVariable, weeklyVariable,
      monthsRemaining, daysLeftInYear, progress, onPace,
    };
  }, [store.data, store.snapshots, store.transactions]);

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
    const fixedJson = JSON.stringify(d.fixed_categories ?? ["Rent"]);
    await db.execute(
      `INSERT INTO finances (user_id, stipend, rent, food, transport, subscriptions, misc, savings_goal, target_date, currency, fixed_categories, year_goal, monthly_savings_target, preferred_savings_source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         stipend=excluded.stipend, rent=excluded.rent, food=excluded.food,
         transport=excluded.transport, subscriptions=excluded.subscriptions,
         misc=excluded.misc, savings_goal=excluded.savings_goal,
         target_date=excluded.target_date, currency=excluded.currency,
         fixed_categories=excluded.fixed_categories, year_goal=excluded.year_goal,
         monthly_savings_target=excluded.monthly_savings_target,
         preferred_savings_source=excluded.preferred_savings_source,
         updated_at=CURRENT_TIMESTAMP`,
      [user!.id, d.stipend, d.rent, d.food, d.transport,
       d.subscriptions, d.misc, d.savings_goal, d.target_date, d.currency ?? "₹",
       fixedJson, d.year_goal ?? 0, d.monthly_savings_target ?? 0,
       d.preferred_savings_source ?? "monthly"]
    );
    store.setData(d);
    computeAll(d, store.transactions);
  }

  async function setPreferredSource(src: "monthly" | "year") {
    if (store.data.preferred_savings_source === src) return;
    await saveSettings({ ...store.data, preferred_savings_source: src });
  }

  async function saveMonthlySnapshot(month: string, totalSpent: number, totalSaved: number) {
    const db = await getDb();
    await db.execute(
      `INSERT INTO finance_snapshots (user_id, month, total_spent, total_saved, actual_by_category)
       VALUES (?, ?, ?, ?, '{}')
       ON CONFLICT(user_id, month) DO UPDATE SET
         total_spent=excluded.total_spent,
         total_saved=excluded.total_saved`,
      [user!.id, month, totalSpent, totalSaved]
    );
    await load();
  }

  async function deleteMonthlySnapshot(month: string) {
    const db = await getDb();
    await db.execute(
      "DELETE FROM finance_snapshots WHERE user_id = ? AND month = ?",
      [user!.id, month]
    );
    await load();
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
    yearStats,
    budgetWarnings,
    calcExpenseImpact,
    saveSettings,
    setPreferredSource,
    addTransaction,
    deleteTransaction,
    saveMonthlySnapshot,
    deleteMonthlySnapshot,
    sendMessage,
    reload: load,
  };
}
