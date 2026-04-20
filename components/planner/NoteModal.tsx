"use client";

import { useState, useEffect } from "react";
import type { QuestionNote } from "@/types";

interface Props {
  questionId: number;
  questionTitle: string;
  onClose: () => void;
  onSave: (questionId: number, content: string) => Promise<void>;
  getNotes: (questionId: number) => Promise<QuestionNote[]>;
}

export default function NoteModal({ questionId, questionTitle, onClose, onSave, getNotes }: Props) {
  const [notes, setNotes]     = useState<QuestionNote[]>([]);
  const [content, setContent] = useState("");
  const [saving, setSaving]   = useState(false);
  const [view, setView]       = useState<"write" | "history">("write");

  useEffect(() => {
    getNotes(questionId).then(setNotes);
  }, [questionId]);

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    await onSave(questionId, content.trim());
    const updated = await getNotes(questionId);
    setNotes(updated);
    setContent("");
    setSaving(false);
    setView("history");
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }} onClick={onClose}>
      <div style={{
        width: "100%", maxWidth: 560, maxHeight: "80vh",
        background: "var(--bg-surface)", border: "1px solid var(--border)",
        borderRadius: 20, overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        display: "flex", flexDirection: "column",
      }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Notes for</p>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                {questionTitle}
              </h2>
            </div>
            <button onClick={onClose} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 18, color: "var(--text-muted)",
            }}>✕</button>
          </div>

          {/* Tab switcher */}
          <div style={{ display: "flex", gap: 3, marginTop: 14, background: "var(--bg-elevated)", padding: 3, borderRadius: 9, width: "fit-content" }}>
            {[
              { id: "write", label: "✏ Write" },
              { id: "history", label: `📋 Saved (${notes.length})` },
            ].map(({ id, label }) => (
              <button key={id} onClick={() => setView(id as any)} style={{
                padding: "5px 14px", borderRadius: 7, fontSize: 12, fontWeight: 500,
                cursor: "pointer", border: "none",
                background: view === id ? "var(--accent)" : "transparent",
                color: view === id ? "#fff" : "var(--text-muted)",
                transition: "all 0.15s",
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {view === "write" ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px 24px", gap: 14 }}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your notes here... observations, patterns, approaches, time complexity..."
                rows={10}
                style={{
                  flex: 1, padding: "14px 16px", borderRadius: 12,
                  border: "1px solid var(--border)", fontSize: 13,
                  color: "var(--text-primary)", background: "var(--bg-elevated)",
                  outline: "none", resize: "none", lineHeight: 1.7,
                  fontFamily: "inherit",
                }}
                onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
                onBlur={(e)  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
              />
              <button onClick={handleSave} disabled={saving || !content.trim()} style={{
                padding: "11px", borderRadius: 10, border: "none",
                fontSize: 13, fontWeight: 600,
                cursor: saving || !content.trim() ? "not-allowed" : "pointer",
                background: saving || !content.trim() ? "var(--border)" : "var(--accent)",
                color: saving || !content.trim() ? "var(--text-muted)" : "#fff",
                boxShadow: saving || !content.trim() ? "none" : "0 0 14px var(--accent-glow)",
              }}>
                {saving ? "Saving…" : "Save Note"}
              </button>
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              {notes.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No notes saved yet</p>
                  <button onClick={() => setView("write")} style={{
                    marginTop: 12, padding: "8px 18px", borderRadius: 9, border: "none",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    background: "var(--accent)", color: "#fff",
                  }}>Write first note</button>
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} style={{
                    border: "1px solid var(--border)", borderRadius: 12,
                    padding: "14px 16px", background: "var(--bg-elevated)",
                  }}>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 8 }}>
                      {new Date(note.created_at).toLocaleString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                    <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                      {note.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
