import { useEffect } from "react";
import { useNotesStore } from "@/store/notesStore";
import { useAuthStore } from "@/store/authStore";
import { getDb } from "@/lib/db";
import type { Note, NoteFormData } from "@/types/notes";

export function useNotes() {
  const { user } = useAuthStore();
  const store = useNotesStore();

  useEffect(() => {
    if (user) void load();
  }, [user]);

  async function load() {
    if (!user) return;
    store.setLoading(true);
    try {
      const db = await getDb();
      const rows = await db.select<Note[]>(
        "SELECT * FROM notes WHERE user_id = ? ORDER BY pinned DESC, created_at DESC",
        [user.id]
      );
      store.setNotes(rows);
    } finally {
      store.setLoading(false);
    }
  }

  async function createNote(data: NoteFormData): Promise<void> {
    if (!user) return;
    const db = await getDb();
    const now = new Date().toISOString();
    const result = await db.execute(
      `INSERT INTO notes (user_id, title, content, topic, color, pinned, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user.id, data.title.trim(), data.content, data.topic.trim(), data.color, data.pinned ? 1 : 0, now, now]
    );
    const note: Note = {
      id: result.lastInsertId as number,
      user_id: user.id,
      title: data.title.trim(),
      content: data.content,
      topic: data.topic.trim(),
      color: data.color,
      pinned: data.pinned ? 1 : 0,
      created_at: now,
      updated_at: now,
    };
    store.addNote(note);
    // Re-sort so pinned ordering is correct
    await load();
  }

  async function updateNote(id: number, data: NoteFormData): Promise<void> {
    if (!user) return;
    const db = await getDb();
    const now = new Date().toISOString();
    await db.execute(
      `UPDATE notes SET title = ?, content = ?, topic = ?, color = ?, pinned = ?, updated_at = ?
       WHERE id = ? AND user_id = ?`,
      [data.title.trim(), data.content, data.topic.trim(), data.color, data.pinned ? 1 : 0, now, id, user.id]
    );
    await load();
  }

  async function deleteNote(id: number): Promise<void> {
    if (!user) return;
    const db = await getDb();
    await db.execute("DELETE FROM notes WHERE id = ? AND user_id = ?", [id, user.id]);
    store.removeNote(id);
  }

  async function togglePin(note: Note): Promise<void> {
    if (!user) return;
    const db = await getDb();
    const newPinned = note.pinned === 1 ? 0 : 1;
    await db.execute(
      "UPDATE notes SET pinned = ?, updated_at = ? WHERE id = ? AND user_id = ?",
      [newPinned, new Date().toISOString(), note.id, user.id]
    );
    await load();
  }

  return {
    notes: store.notes,
    loading: store.loading,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    reload: load,
  };
}
