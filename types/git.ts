export type GitSectionTone =
  | "intro"
  | "concepts"
  | "commands"
  | "scenario"
  | "traps"
  | "principle";

export interface GitConcept {
  name: string;
  body: string;
}

export interface GitCommandRow {
  command: string;
  when: string;
}

export interface GitSection {
  id: string;
  label: string;
  tone: GitSectionTone;
  body?: string;
  concepts?: GitConcept[];
  commands?: GitCommandRow[];
  code?: { lang: string; source: string };
  traps?: string[];
}

export type GitChapterKind = "chapter" | "cheatsheet";

export interface GitChapter {
  num: number;
  kind: GitChapterKind;
  title: string;
  subtitle: string;
  accentColor: string;
  why?: string;
  sections: GitSection[];
}

export interface GitProgressRow {
  id: number;
  user_id: number;
  chapter_num: number;
  done: number;
  section_index: number;
  notes: string;
  completed_at: string | null;
  updated_at: string;
}

export interface GitChapterProgress {
  chapter: number;
  done: boolean;
  sectionIndex: number;
  notes: string;
  completedAt: string | null;
}
