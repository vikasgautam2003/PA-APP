export type AwsPhase = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type AwsDayKind = "lesson" | "review" | "capstone";

export type AwsSectionTone = "intro" | "concept" | "config" | "project" | "trap" | "compare" | "real" | "cli";

export interface AwsSection {
  id: string;
  label: string;
  tone: AwsSectionTone;
  body: string;
  code?: { lang: string; source: string };
  table?: { headers: string[]; rows: string[][] };
}

export interface AwsDay {
  day: number;
  phase: AwsPhase;
  weekInPhase: number;
  kind: AwsDayKind;
  topic?: string;
  task?: string;
  depth?: string;
  source?: string;
  whyMatters?: string;
  howToDoIt?: string;
  watchOutFor?: string;
  doneWhen?: string;
  examTrap?: string;
  realWorld?: string;
  sections?: AwsSection[];
  examWeight?: string;
  phaseProgress: number;
}

export interface AwsCapstoneStep {
  range: string;
  description: string;
}

export interface AwsCapstone {
  phase: AwsPhase;
  name: string;
  tagline: string;
  summary: string;
  stack: string[];
  buildPhases: AwsCapstoneStep[];
  challenges: string[];
  outcome: string;
}

export interface AwsPhaseMeta {
  phase: AwsPhase;
  title: string;
  tagline: string;
  range: string;
  goal: string;
  weeks: { range: string; summary: string }[];
}

export interface AwsProgressRow {
  id: number;
  user_id: number;
  day_number: number;
  task_done: number;
  section_index: number;
  notes: string;
  completed_at: string | null;
  updated_at: string;
}

export interface AwsDayProgress {
  day: number;
  taskDone: boolean;
  sectionIndex: number;
  notes: string;
  completedAt: string | null;
}

export type AwsChatRole = "user" | "assistant";

export interface AwsWebResult {
  title: string;
  link: string;
  snippet: string;
}

export interface AwsImageResult {
  title: string;
  link: string;
  thumbnail: string;
  original: string;
  source: string;
}

export interface AwsVideoResult {
  title: string;
  link: string;
  thumbnail: string;
  duration: string;
  date: string;
  channel: string;
  snippet: string;
}

export interface AwsAnswerBox {
  title?: string;
  snippet: string;
  link?: string;
}

export interface AwsChatSources {
  web: AwsWebResult[];
  images: AwsImageResult[];
  videos: AwsVideoResult[];
  answerBox?: AwsAnswerBox;
}

export interface AwsChatMessage {
  id: number;
  day: number;
  role: AwsChatRole;
  content: string;
  sources: AwsChatSources;
  createdAt: string;
}

export interface AwsChatRow {
  id: number;
  user_id: number;
  day_number: number;
  role: string;
  content: string;
  sources: string;
  created_at: string;
}
