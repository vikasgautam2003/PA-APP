"use client";

import { useState, useMemo } from "react";
import { useNotes } from "@/hooks/useNotes";
import NoteCard from "@/components/notes/NoteCard";
import NoteEditor from "@/components/notes/NoteEditor";
import type { Note, NoteFormData } from "@/types/notes";

export default function NotesPage() {
  const { notes, loading, createNote, updateNote, deleteNote, togglePin } = useNotes();

  const [editorOpen, setEditorOpen]   = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [search, setSearch]           = useState("");
  const [filterTopic, setFilterTopic] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  // Distinct topics from existing notes
  const allTopics = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => { if (n.topic) set.add(n.topic); });
    return Array.from(set).sort();
  }, [notes]);

  // Filtered + searched notes
  const filtered = useMemo(() => {
    let result = notes;
    if (filterTopic !== "all") result = result.filter((n) => n.topic === filterTopic);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.topic.toLowerCase().includes(q)
      );
    }
    return result;
  }, [notes, filterTopic, search]);

  const pinnedNotes   = filtered.filter((n) => n.pinned === 1);
  const unpinnedNotes = filtered.filter((n) => n.pinned === 0);

  function openCreate() {
    setEditingNote(null);
    setEditorOpen(true);
  }

  function openEdit(note: Note) {
    setEditingNote(note);
    setEditorOpen(true);
  }

  async function handleSave(data: NoteFormData) {
    if (editingNote) {
      await updateNote(editingNote.id, data);
    } else {
      await createNote(data);
    }
  }

  async function handleDelete(id: number) {
    setDeleteTarget(id);
  }

  async function confirmDelete() {
    if (deleteTarget !== null) {
      await deleteNote(deleteTarget);
      setDeleteTarget(null);
    }
  }

  const totalWords = notes.reduce((acc, n) => {
    return acc + (n.content.trim() === "" ? 0 : n.content.trim().split(/\s+/).length);
  }, 0);

  return (
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      background: "var(--bg-surface)", overflow: "hidden",
    }}>

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div style={{
        padding: "16px 40px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "var(--bg-surface)", flexShrink: 0,
      }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
            Notes
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", lineHeight: 1 }}>
            My Notes
          </h1>
        </div>

        {/* Stats strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {[
            `${notes.length} note${notes.length !== 1 ? "s" : ""}`,
            `${allTopics.length} topic${allTopics.length !== 1 ? "s" : ""}`,
            `${totalWords.toLocaleString()} words`,
            `${pinnedNotes.length} pinned`,
          ].map((item, i, arr) => (
            <span key={i} style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: i === 0 ? "var(--text-primary)" : "var(--text-muted)", fontWeight: i === 0 ? 600 : 400 }}>{item}</span>
              {i < arr.length - 1 && <span style={{ fontSize: 11, color: "var(--border)", margin: "0 12px" }}>·</span>}
            </span>
          ))}
        </div>

        <button
          onClick={openCreate}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "9px 20px", borderRadius: 10,
            border: "none", background: "var(--accent)", color: "#fff",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 0 16px var(--accent-glow)",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.9")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
          New Note
        </button>
      </div>

      {/* ── Toolbar: search + topic filter ──────────────────────── */}
      <div style={{
        padding: "14px 40px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 12,
        background: "var(--bg-surface)", flexShrink: 0,
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, maxWidth: 380 }}>
          <span style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
            fontSize: 12, color: "var(--text-muted)", pointerEvents: "none",
          }}>⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes…"
            style={{
              width: "100%", padding: "8px 12px 8px 32px",
              borderRadius: 10, border: "1px solid var(--border)",
              background: "var(--bg-elevated)", color: "var(--text-primary)",
              fontSize: 13, outline: "none", fontFamily: "inherit",
              transition: "border-color 0.12s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-muted)", fontSize: 14, lineHeight: 1,
              }}
            >×</button>
          )}
        </div>

        {/* Topic pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["all", ...allTopics].map((t) => (
            <button
              key={t}
              onClick={() => setFilterTopic(t)}
              style={{
                padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 500,
                border: `1px solid ${filterTopic === t ? "var(--accent)" : "var(--border)"}`,
                background: filterTopic === t ? "var(--accent-glow)" : "var(--bg-elevated)",
                color: filterTopic === t ? "var(--accent-text)" : "var(--text-muted)",
                cursor: "pointer", transition: "all 0.12s",
                whiteSpace: "nowrap",
              }}
            >
              {t === "all" ? "All Topics" : t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 40px" }}>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-muted)" }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid var(--border)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
            <span style={{ fontSize: 13 }}>Loading notes…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 16, paddingTop: 80,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28,
            }}>
              {notes.length === 0 ? "✎" : "⌕"}
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                {notes.length === 0 ? "No notes yet" : "No notes match your search"}
              </p>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {notes.length === 0
                  ? "Hit \"New Note\" to capture your first idea."
                  : "Try a different search term or topic filter."}
              </p>
            </div>
            {notes.length === 0 && (
              <button
                onClick={openCreate}
                style={{
                  padding: "10px 24px", borderRadius: 10, border: "none",
                  background: "var(--accent)", color: "#fff",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 0 16px var(--accent-glow)",
                }}
              >
                Create your first note
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Pinned section */}
            {pinnedNotes.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <p style={{
                  fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
                  letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14,
                }}>
                  Pinned · {pinnedNotes.length}
                </p>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 14,
                }}>
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      onTogglePin={togglePin}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All / Unpinned section */}
            {unpinnedNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <p style={{
                    fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
                    letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14,
                  }}>
                    Notes · {unpinnedNotes.length}
                  </p>
                )}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 14,
                }}>
                  {unpinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      onTogglePin={togglePin}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Editor modal */}
      {editorOpen && (
        <NoteEditor
          note={editingNote}
          allTopics={allTopics}
          onSave={handleSave}
          onClose={() => setEditorOpen(false)}
        />
      )}

      {/* Delete confirm modal */}
      {deleteTarget !== null && (
        <div
          onClick={() => setDeleteTarget(null)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
            zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              borderRadius: 16, padding: "28px 32px", maxWidth: 380,
              boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>🗑</div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
              Delete this note?
            </p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
              This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{
                  padding: "9px 22px", borderRadius: 10,
                  border: "1px solid var(--border)", background: "var(--bg-surface)",
                  color: "var(--text-muted)", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => void confirmDelete()}
                style={{
                  padding: "9px 22px", borderRadius: 10,
                  border: "none", background: "var(--hard)", color: "#fff",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 0 12px rgba(220,38,38,0.4)",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
