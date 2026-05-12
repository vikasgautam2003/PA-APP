export type GhaSectionTone = "intro" | "concepts" | "yaml" | "tasks" | "principle" | "concept";

export interface GhaConcept {
  name: string;
  body: string;
}

export interface GhaSection {
  id: string;
  label: string;
  tone: GhaSectionTone;
  body?: string;
  concepts?: GhaConcept[];
  tasks?: string[];
  code?: { lang: string; source: string };
}

export type GhaChapterKind = "chapter" | "capstone";

export interface GhaDeliverable {
  title: string;
  body: string;
}

export interface GhaChapter {
  num: number;
  kind: GhaChapterKind;
  title: string;
  subtitle: string;
  whyMatters?: string;
  miniProjectTitle?: string;
  miniProjectDesc?: string;
  sections: GhaSection[];
  deliverables?: GhaDeliverable[];
}

export interface GhaProgressRow {
  id: number;
  user_id: number;
  chapter_num: number;
  done: number;
  section_index: number;
  notes: string;
  completed_at: string | null;
  updated_at: string;
}

export interface GhaChapterProgress {
  chapter: number;
  done: boolean;
  sectionIndex: number;
  notes: string;
  completedAt: string | null;
}
