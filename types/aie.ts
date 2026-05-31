// AI Engineer Master Roadmap — phase-based course.
// Mirrors the chapter-based shape used by GHA/Git, with phase-specific extras
// (study sources, comparison tables, mini-project checklists).

export type AieSectionTone =
  | "intro"      // why this matters / framing
  | "concepts"   // grid of named concept cards
  | "bullets"    // plain bullet list (the most common section body)
  | "table"      // comparison / pricing table
  | "tasks"      // hands-on numbered steps
  | "principle"; // highlighted callout

export interface AieConcept {
  name: string;
  body: string;
}

export interface AieSource {
  label: string;
  url: string;
}

export interface AieTable {
  headers: string[];
  rows: string[][];
}

export interface AieSection {
  id: string;
  label: string;          // e.g. "0.1 Operating System & Terminal"
  heading?: string;       // optional sub-heading e.g. "Linux / macOS Terminal Mastery"
  tone: AieSectionTone;
  body?: string;
  bullets?: string[];
  concepts?: AieConcept[];
  tasks?: string[];
  table?: AieTable;
  sources?: AieSource[];
  code?: { lang: string; source: string };
}

export type AiePhaseKind = "phase" | "capstone" | "appendix";

export interface AieDeliverable {
  title: string;
  body: string;
}

export interface AiePhase {
  num: number;            // sequential 1..N (stable id for progress)
  phaseLabel: string;     // display tag e.g. "PHASE 0", "CAPSTONE", "APPENDIX"
  kind: AiePhaseKind;
  title: string;
  subtitle: string;
  whyMatters?: string;
  miniProjectTitle?: string;
  miniProjectDesc?: string;
  miniProjectChecklist?: string[];
  sections: AieSection[];
  deliverables?: AieDeliverable[];
}

export interface AieProgressRow {
  id: number;
  user_id: number;
  phase_num: number;
  done: number;
  section_index: number;
  notes: string;
  completed_at: string | null;
  updated_at: string;
}

export interface AiePhaseProgress {
  phase: number;
  done: boolean;
  sectionIndex: number;
  notes: string;
  completedAt: string | null;
}
