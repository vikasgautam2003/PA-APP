"use client";

import { useState } from "react";
import type { DSAQuestionWithProgress, QuestionNote } from "@/types";
import QuestionDetailModal from "@/components/dsa/QuestionDetailModal";

const CYCLE: Record<string, "todo" | "solving" | "done"> = {
  todo: "solving", solving: "done", done: "todo",
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

interface Props {
  label: string;
  questions: DSAQuestionWithProgress[];
  onClose: () => void;
  onStatusChange: (id: number, status: "todo" | "solving" | "done") => void;
  onAddNote: (questionId: number, content: string) => Promise<void>;
  onGetNotes: (questionId: number) => Promise<QuestionNote[]>;
}

export default function GroupedQuestionsModal({ label, questions, onClose, onStatusChange, onAddNote, onGetNotes }: Props) {
  const [selected, setSelected] = useState<DSAQuestionWithProgress | null>(null);
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState<"All" | "Easy" | "Medium" | "Hard">("All");

  const filtered = questions.filter((q) => {
    if (diffFilter !== "All" && q.difficulty !== diffFilter) return false;
    if (search && !q.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const done = questions.filter((q) => q.status === "done").length;

  return (
    <>
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 900,
          background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24,
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div style={{
          width: "100%", maxWidth: 720,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          display: "flex", flexDirection: "column",
          maxHeight: "85vh", overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "22px 26px 16px",
            borderBottom: "1px solid var(--border)",
            display: "flex", flexDirection: "column", gap: 14,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
                  {label}
                </h2>
                <p style={{ fontSize: 12, color: "var(--text-faint)", margin: "4px 0 0" }}>
                  {done}/{questions.length} solved
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)",
                  background: "var(--bg-hover)", color: "var(--text-muted)",
                  fontSize: 16, cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}
              >✕</button>
            </div>

            {/* Search + Diff filter */}
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                style={{
                  flex: 1, padding: "8px 14px", borderRadius: 10,
                  border: "1px solid var(--border)", fontSize: 13,
                  color: "var(--text-primary)", background: "var(--bg-surface)", outline: "none",
                }}
                onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
              />
              <div style={{ display: "flex", gap: 4, background: "var(--bg-surface)", padding: 4, borderRadius: 10, border: "1px solid var(--border)" }}>
                {(["All","Easy","Medium","Hard"] as const).map((d) => (
                  <button key={d} onClick={() => setDiffFilter(d)} style={{
                    padding: "5px 12px", borderRadius: 7, fontSize: 11, fontWeight: diffFilter === d ? 600 : 400,
                    border: "none", cursor: "pointer",
                    background: diffFilter === d ? "var(--accent)" : "transparent",
                    color: diffFilter === d ? "#fff" : "var(--text-muted)",
                  }}>{d}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Question list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--text-faint)", fontSize: 13, padding: "32px 0" }}>No questions match</p>
            ) : filtered.map((q) => {
              const done = q.status === "done";
              const solving = q.status === "solving";
              const companiesList = q.companies ? q.companies.split(",").map((c) => c.trim()).filter(Boolean) : [];

              return (
                <div
                  key={q.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "11px 14px", borderRadius: 10,
                    border: `1px solid ${done ? "var(--easy-bg)" : "var(--border)"}`,
                    background: done ? "var(--easy-bg)" : "var(--bg-surface)",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => { if (!done) (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = done ? "var(--easy-bg)" : "var(--bg-surface)"; }}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => onStatusChange(q.id, CYCLE[q.status])}
                    style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                      border: `1.5px solid ${done ? "var(--easy)" : solving ? "var(--medium)" : "var(--border-subtle)"}`,
                      background: done ? "var(--easy)" : "transparent",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {done && (
                      <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {solving && <div style={{ width: 7, height: 7, borderRadius: 2, background: "var(--medium)" }} />}
                  </button>

                  {/* Number */}
                  <span style={{ fontSize: 10, color: "var(--text-faint)", width: 30, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                    #{q.id}
                  </span>

                  {/* Title */}
                  <span
                    onClick={() => setSelected(q)}
                    style={{
                      flex: 1, fontSize: 13, fontWeight: done ? 400 : 500,
                      color: done ? "var(--text-muted)" : "var(--text-primary)",
                      textDecoration: done ? "line-through" : "none",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => { if (!done) (e.currentTarget as HTMLElement).style.color = "var(--accent-text)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = done ? "var(--text-muted)" : "var(--text-primary)"; }}
                  >
                    {q.title}
                  </span>

                  {/* Company badges — 1 visible */}
                  {companiesList.slice(0, 1).map((c) => {
                    const col = companyColor(c);
                    return (
                      <span key={c} style={{
                        fontSize: 10, fontWeight: 600,
                        background: col.bg, color: col.text,
                        padding: "2px 8px", borderRadius: 99,
                        flexShrink: 0, whiteSpace: "nowrap",
                      }}>{c}</span>
                    );
                  })}
                  {companiesList.length > 1 && (
                    <span style={{
                      fontSize: 10, color: "var(--text-faint)",
                      background: "var(--bg-hover)", padding: "2px 7px",
                      borderRadius: 99, border: "1px solid var(--border)", flexShrink: 0,
                    }}>+{companiesList.length - 1}</span>
                  )}

                  {/* Difficulty */}
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    color: DIFF_COLOR[q.difficulty], background: DIFF_BG[q.difficulty],
                    padding: "2px 9px", borderRadius: 99, flexShrink: 0,
                  }}>
                    {q.difficulty}
                  </span>

                  {/* Link */}
                  {q.link && (
                    <button
                      onClick={async () => {
                        try {
                          const { open } = await import("@tauri-apps/plugin-shell");
                          await open(q.link!);
                        } catch { window.open(q.link!, "_blank"); }
                      }}
                      style={{ fontSize: 12, color: "var(--text-faint)", background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--accent-text)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-faint)")}
                    >↗</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Question detail — layered on top */}
      {selected && (
        <QuestionDetailModal
          question={selected}
          onClose={() => setSelected(null)}
          onStatusChange={onStatusChange}
          onAddNote={onAddNote}
          onGetNotes={onGetNotes}
        />
      )}
    </>
  );
}
