export type NoteColor =
  | "default"
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "purple"
  | "pink";

export interface Note {
  id: number;
  user_id: number;
  title: string;
  content: string;
  topic: string;
  color: NoteColor;
  pinned: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface NoteFormData {
  title: string;
  content: string;
  topic: string;
  color: NoteColor;
  pinned: boolean;
}
