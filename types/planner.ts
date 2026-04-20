export interface PlannerTopic {
  id: number;
  user_id: number;
  title: string;
  order_index: number;
  created_at: string;
}

export interface PlannerSubtopic {
  id: number;
  topic_id: number;
  user_id: number;
  label: string;
  timestamp_raw: string;
  order_index: number;
  is_done: boolean;
  done_at: string | null;
}

export interface PlannerTopicWithSubtopics extends PlannerTopic {
  subtopics: PlannerSubtopic[];
}

export interface DayPlanItem {
  type: "subtopic" | "dsa";
  id: number;
  label: string;
  difficulty?: string;
  topic?: string;
  is_done: boolean;
  done_at: string | null;
}

export interface DayPlan {
  date: string;
  day: string;
  items: DayPlanItem[];
  status: "pending" | "green" | "amber" | "red" | "rest";
}

export interface WeekPlan {
  id?: number;
  week_start: string;
  days: DayPlan[];
  generated_at: string;
}

export interface QuestionNote {
  id: number;
  user_id: number;
  question_id: number;
  content: string;
  created_at: string;
}

export interface DifficultyRamp {
  easy: number;
  medium: number;
  hard: number;
}
