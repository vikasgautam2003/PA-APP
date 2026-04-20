export interface FinanceData {
  id?: number;
  user_id?: number;
  stipend: number;
  rent: number;
  food: number;
  transport: number;
  subscriptions: number;
  misc: number;
  savings_goal: number;
  target_date: string | null;
  currency: "₹" | "$";
}

export interface SavingsProjection {
  monthly: number;
  threeMonth: number;
  sixMonth: number;
  yearly: number;
  weeklySpend: number;
  monthsToGoal: number | null;
}

export interface ExpenseBreakdown {
  label: string;
  amount: number;
  percent: number;
  color: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type TransactionCategory =
  | "Food"
  | "Transport"
  | "Shopping"
  | "Entertainment"
  | "Bills"
  | "Rent"
  | "Health"
  | "Other";

export interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  category: TransactionCategory;
  note: string;
  date: string;
  created_at: string;
}

export interface TransactionFormData {
  amount: number;
  category: TransactionCategory;
  note: string;
  date: string;
}

export interface MonthlySnapshot {
  id: number;
  user_id: number;
  month: string;
  total_spent: number;
  total_saved: number;
  actual_by_category: string;
  created_at: string;
}

export interface CategorySummary {
  category: TransactionCategory;
  budgeted: number;
  spent: number;
  percent: number;
  color: string;
  transactions: Transaction[];
}

export interface ScenarioProjection {
  label: string;
  description: string;
  monthlySavings: number;
  monthsToGoal: number | null;
  goalDate: string | null;
  color: string;
}
