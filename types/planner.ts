export interface DayPlan {
  day: string;
  question_ids: number[];
  focus_topic: string;
  rationale: string;
}

export interface WeekPlan {
  week_start: string;
  days: DayPlan[];
  weekly_goal: string;
}

export interface WeekPlanRecord {
  id: number;
  user_id: number;
  week_start: string;
  plan_json: string;
  created_at: string;
}

export interface PlannerPreferences {
  target_date: string;
  weak_topics: string[];
  hours_per_day: number;
}