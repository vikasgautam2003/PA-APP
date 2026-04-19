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