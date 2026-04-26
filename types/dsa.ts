export type Difficulty = "Easy" | "Medium" | "Hard";
export type DSAStatus = "todo" | "solving" | "done";

export interface DSAQuestion {
  id: number;
  title: string;
  topic: string;
  difficulty: Difficulty;
  link: string | null;
  notes: string | null;
  companies: string | null;
}

export interface DSAProgress {
  id: number;
  user_id: number;
  question_id: number;
  status: DSAStatus;
  user_notes: string | null;
  solved_at: string | null;
  updated_at: string;
}

export interface DSAQuestionWithProgress extends DSAQuestion {
  status: DSAStatus;
  user_notes: string | null;
  solved_at: string | null;
}

export interface TopicProgress {
  topic: string;
  total: number;
  done: number;
  solving: number;
}

export interface CompanyProgress {
  company: string;
  total: number;
  done: number;
}

export interface HeatmapEntry {
  date: string;
  count: number;
}
