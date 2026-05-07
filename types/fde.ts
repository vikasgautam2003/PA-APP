export type FdeMonth = 1 | 2 | 3;

export type FdeDayKind = "lesson" | "rest" | "capstone";

export interface FdeDsa {
  tier: string;
  title: string;
  approach: string;
}

export interface FdeDay {
  day: number;
  month: FdeMonth;
  weekInMonth: 1 | 2 | 3 | 4 | 5;
  kind: FdeDayKind;
  dsaTier?: string;
  topic?: string;
  task?: string;
  depth?: string;
  source?: string;
  whyMatters?: string;
  howToDoIt?: string;
  watchOutFor?: string;
  doneWhen?: string;
  dsa?: FdeDsa;
  capstoneProgress: number;
}

export interface FdeCapstonePhase {
  range: string;
  description: string;
}

export interface FdeCapstone {
  month: FdeMonth;
  name: string;
  tagline: string;
  summary: string;
  stack: string[];
  buildPhases: FdeCapstonePhase[];
  challenges: string[];
  outcome: string;
}

export interface FdeMonthMeta {
  month: FdeMonth;
  title: string;
  tagline: string;
  dsaArc: string;
  devArc: string;
  goal: string;
  weeks: { range: string; summary: string }[];
}

export interface FdeProgressRow {
  id: number;
  user_id: number;
  day_number: number;
  task_done: number;
  dsa_done: number;
  notes: string;
  completed_at: string | null;
  updated_at: string;
}

export interface FdeDayProgress {
  day: number;
  taskDone: boolean;
  dsaDone: boolean;
  notes: string;
  completedAt: string | null;
}
