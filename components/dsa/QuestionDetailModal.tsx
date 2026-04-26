"use client";

import { useState, useEffect } from "react";
import type { DSAQuestionWithProgress, QuestionNote } from "@/types";

interface Props {
  question: DSAQuestionWithProgress;
  onClose: () => void;
  onStatusChange: (id: number, status: "todo" | "solving" | "done") => void;
  onAddNote: (questionId: number, content: string) => Promise<void>;
  onGetNotes: (questionId: number) => Promise<QuestionNote[]>;
}

const CYCLE: Record<string, "todo" | "solving" | "done"> = {
  todo: "solving", solving: "done", done: "todo",
};

const STATUS_LABEL: Record<string, string> = {
  todo: "Todo", solving: "Solving", done: "Done",
};

const DIFF_COLOR: Record<string, string> = {
  Easy: "var(--easy)", Medium: "var(--medium)", Hard: "var(--hard)",
};
const DIFF_BG: Record<string, string> = {
  Easy: "var(--easy-bg)", Medium: "var(--medium-bg)", Hard: "var(--hard-bg)",
};

const COMPANY_COLORS = [
  { bg: "#1e3a5f", text: "#60a5fa" },
  { bg: "#1e3a2f", text: "#4ade80" },
  { bg: "#3a1e1e", text: "#f87171" },
  { bg: "#2d1e3a", text: "#c084fc" },
  { bg: "#1e2d3a", text: "#38bdf8" },
  { bg: "#3a2d1e", text: "#fb923c" },
];

function companyColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COMPANY_COLORS[Math.abs(hash) % COMPANY_COLORS.length];
}

export default function QuestionDetailModal({ question, onClose, onStatusChange, onAddNote, onGetNotes }: Props) {
  const { id, title, topic, difficulty, link, notes, companies, status } = question;
  const [userNotes, setUserNotes] = useState<QuestionNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);

  const companiesList = companies
    ? companies.split(",").map((c) => c.trim()).filter(Boolean)
    : [];

  useEffect(() => {
    onGetNotes(id).then(setUserNotes);
  }, [id]);

  async function handleSaveNote() {
    if (!newNote.trim()) return;
    setSaving(true);
    await onAddNote(id, newNote.trim());
    setNewNote("");
    const updated = await onGetNotes(id);
    setUserNotes(updated);
    setSaving(false);
  }

  async function openLink() {
    if (!link) return;
    try {
      const { open } = await import("@tauri-apps/plugin-shell");
      await open(link);
    } catch {
      window.open(link, "_blank");
    }
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: "100%", maxWidth: 640,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        overflow: "hidden",
        maxHeight: "90vh",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          padding: "24px 28px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex", flexDirection: "column", gap: 14,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              <span style={{ fontSize: 11, color: "var(--text-faint)", fontVariantNumeric: "tabular-nums" }}>
                #{id}
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.3 }}>
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)",
                background: "var(--bg-hover)", color: "var(--text-muted)",
                fontSize: 16, cursor: "pointer", flexShrink: 0, display: "flex",
                alignItems: "center", justifyContent: "center",
              }}
            >✕</button>
          </div>

          {/* Badges row */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {/* Difficulty */}
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: DIFF_COLOR[difficulty], background: DIFF_BG[difficulty],
              padding: "4px 12px", borderRadius: 99,
            }}>
              {difficulty}
            </span>

            {/* Topic */}
            <span style={{
              fontSize: 11, color: "var(--text-muted)",
              background: "var(--bg-hover)", padding: "4px 12px",
              borderRadius: 99, border: "1px solid var(--border)",
            }}>
              {topic}
            </span>

            {/* Status */}
            <button
              onClick={() => onStatusChange(id, CYCLE[status])}
              style={{
                fontSize: 11, fontWeight: 600, cursor: "pointer",
                padding: "4px 12px", borderRadius: 99, border: "none",
                background: status === "done" ? "var(--easy-bg)" : status === "solving" ? "var(--medium-bg)" : "var(--bg-hover)",
                color: status === "done" ? "var(--easy)" : status === "solving" ? "var(--medium)" : "var(--text-muted)",
              }}
              title="Click to cycle status"
            >
              {status === "done" ? "✓ " : status === "solving" ? "◑ " : "○ "}{STATUS_LABEL[status]}
            </button>

            {/* Link */}
            {link && (
              <button
                onClick={openLink}
                style={{
                  fontSize: 11, fontWeight: 600, cursor: "pointer",
                  padding: "4px 12px", borderRadius: 99, border: "none",
                  background: "var(--accent-glow)", color: "var(--accent-text)",
                }}
              >
                ↗ LeetCode
              </button>
            )}
          </div>

          {/* Companies */}
          {companiesList.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {companiesList.map((c) => {
                const col = companyColor(c);
                return (
                  <span
                    key={c}
                    style={{
                      fontSize: 10, fontWeight: 600,
                      background: col.bg, color: col.text,
                      padding: "3px 10px", borderRadius: 99,
                      border: `1px solid ${col.text}22`,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {c}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Question notes */}
          {notes && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Notes
              </p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                {notes}
              </p>
            </div>
          )}

          {/* My notes */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              My Notes
            </p>

            {userNotes.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                {userNotes.map((n) => (
                  <div key={n.id} style={{
                    padding: "10px 14px", borderRadius: 10,
                    background: "var(--bg-surface)", border: "1px solid var(--border)",
                    fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5,
                  }}>
                    <p style={{ margin: 0 }}>{n.content}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 10, color: "var(--text-faint)" }}>
                      {new Date(n.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: 10,
                  border: "1px solid var(--border)", resize: "vertical",
                  fontSize: 13, color: "var(--text-primary)", background: "var(--bg-surface)",
                  outline: "none", fontFamily: "inherit", lineHeight: 1.5,
                }}
                onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
              />
            </div>
            <button
              onClick={handleSaveNote}
              disabled={saving || !newNote.trim()}
              style={{
                marginTop: 8, padding: "8px 20px", borderRadius: 9,
                border: "none", cursor: saving || !newNote.trim() ? "not-allowed" : "pointer",
                background: "var(--accent)", color: "#fff",
                fontSize: 12, fontWeight: 600,
                opacity: saving || !newNote.trim() ? 0.5 : 1,
              }}
            >
              {saving ? "Saving..." : "Save Note"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
