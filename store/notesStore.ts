import { create } from "zustand";
import type { Note } from "@/types/notes";

interface NotesState {
  notes: Note[];
  loading: boolean;
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (note: Note) => void;
  removeNote: (id: number) => void;
  setLoading: (v: boolean) => void;
}

export const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  loading: false,
  setNotes: (notes) => set({ notes }),
  addNote: (note) => set((s) => ({ notes: [note, ...s.notes] })),
  updateNote: (note) =>
    set((s) => ({ notes: s.notes.map((n) => (n.id === note.id ? note : n)) })),
  removeNote: (id) =>
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
  setLoading: (loading) => set({ loading }),
}));
