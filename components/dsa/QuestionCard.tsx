"use client";

import { useState } from "react";
import type { DSAQuestionWithProgress, QuestionNote } from "@/types";
import NoteModal from "@/components/planner/NoteModal";
import QuestionDetailModal from "@/components/dsa/QuestionDetailModal";

interface Props {
  question: DSAQuestionWithProgress;
  onStatusChange: (id: number, status: "todo" | "solving" | "done") => void;
  onAddNote: (questionId: number, content: string) => Promise<void>;
  onGetNotes: (questionId: number) => Promise<QuestionNote[]>;
}

const CYCLE: Record<string, "todo" | "solving" | "done"> = {
  todo: "solving", solving: "done", done: "todo",
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

export default function QuestionCard({ question, onStatusChange, onAddNote, onGetNotes }: Props) {
  const { id, title, topic, difficulty, link, status, companies } = question;
  const done    = status === "done";
  const solving = status === "solving";

  const [noteOpen, setNoteOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const diffColor = difficulty === "Easy" ? "var(--easy)"    : difficulty === "Medium" ? "var(--medium)" : "var(--hard)";
  const diffBg    = difficulty === "Easy" ? "var(--easy-bg)" : difficulty === "Medium" ? "var(--medium-bg)" : "var(--hard-bg)";

  const companiesList = companies
    ? companies.split(",").map((c) => c.trim()).filter(Boolean)
    : [];
  const visibleCompanies = companiesList.slice(0, 2);
  const extraCount = companiesList.length - 2;

  return (
    <>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "12px 18px",
          border: `1px solid ${done ? "var(--easy-bg)" : "var(--border)"}`,
          borderRadius: 12,
          background: done ? "var(--easy-bg)" : "var(--bg-elevated)",
          boxShadow: "var(--shadow-card)",
          cursor: "default",
        }}
        onMouseEnter={(e) => {
          if (!done) (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = done ? "var(--easy-bg)" : "var(--bg-elevated)";
        }}
      >
        {/* Checkbox */}
        <button
          onClick={() => onStatusChange(id, CYCLE[status])}
          style={{
            width: 20, height: 20, borderRadius: 6, flexShrink: 0,
            border: `1.5px solid ${done ? "var(--easy)" : solving ? "var(--medium)" : "var(--border-subtle)"}`,
            background: done ? "var(--easy)" : "transparent",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {done && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {solving && <div style={{ width: 8, height: 8, borderRadius: 2, background: "var(--medium)" }} />}
        </button>

        {/* Number */}
        <span style={{ fontSize: 11, color: "var(--text-faint)", width: 34, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
          #{id}
        </span>

        {/* Title — clickable to open detail modal */}
        <span
          onClick={() => setDetailOpen(true)}
          style={{
            flex: 1, fontSize: 14, fontWeight: done ? 400 : 500,
            color: done ? "var(--text-muted)" : "var(--text-primary)",
            textDecoration: done ? "line-through" : "none",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            letterSpacing: "-0.01em", cursor: "pointer",
          }}
          onMouseEnter={(e) => { if (!done) (e.currentTarget as HTMLElement).style.color = "var(--accent-text)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = done ? "var(--text-muted)" : "var(--text-primary)"; }}
        >
          {title}
        </span>

        {/* Company badges — up to 2 visible, +N overflow */}
        {visibleCompanies.map((c) => {
          const col = companyColor(c);
          return (
            <span key={c} style={{
              fontSize: 10, fontWeight: 600,
              background: col.bg, color: col.text,
              padding: "3px 9px", borderRadius: 99,
              border: `1px solid ${col.text}22`,
              flexShrink: 0, whiteSpace: "nowrap",
              letterSpacing: "0.02em",
            }}>
              {c}
            </span>
          );
        })}
        {extraCount > 0 && (
          <span style={{
            fontSize: 10, fontWeight: 600,
            background: "var(--bg-hover)", color: "var(--text-faint)",
            padding: "3px 9px", borderRadius: 99,
            border: "1px solid var(--border)", flexShrink: 0,
          }}>
            +{extraCount}
          </span>
        )}

        {/* Topic */}
        <span style={{
          fontSize: 11, color: "var(--text-muted)",
          background: "var(--bg-hover)", padding: "3px 10px",
          borderRadius: 99, border: "1px solid var(--border)",
          maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis",
          whiteSpace: "nowrap", flexShrink: 0,
        }}>
          {topic}
        </span>

        {/* Difficulty */}
        <span style={{
          fontSize: 11, fontWeight: 600,
          color: diffColor, background: diffBg,
          padding: "3px 10px", borderRadius: 99, flexShrink: 0,
        }}>
          {difficulty}
        </span>

        {/* Note button */}
        <button
          onClick={() => setNoteOpen(true)}
          style={{
            fontSize: 11, fontWeight: 600,
            color: "var(--accent-text)",
            background: "var(--accent-glow)",
            padding: "3px 10px", borderRadius: 99,
            border: "none", cursor: "pointer", flexShrink: 0,
            transition: "all 0.15s",
          }}
          title="Write or view notes"
        >
          ✏ Notes
        </button>

        {/* Link */}
        {link && (
          <button
            onClick={async (e) => {
              e.stopPropagation();
              try {
                const { open } = await import("@tauri-apps/plugin-shell");
                await open(link);
              } catch {
                window.open(link, "_blank");
              }
            }}
            style={{
              fontSize: 13, color: "var(--text-faint)",
              background: "none", border: "none",
              cursor: "pointer", flexShrink: 0,
              transition: "color 0.15s", padding: 0,
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--accent-text)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-faint)")}
            title="Open on LeetCode"
          >↗</button>
        )}
      </div>

      {/* Note Modal */}
      {noteOpen && (
        <NoteModal
          questionId={id}
          questionTitle={title}
          onClose={() => setNoteOpen(false)}
          onSave={onAddNote}
          getNotes={onGetNotes}
        />
      )}

      {/* Detail Modal */}
      {detailOpen && (
        <QuestionDetailModal
          question={question}
          onClose={() => setDetailOpen(false)}
          onStatusChange={onStatusChange}
          onAddNote={onAddNote}
          onGetNotes={onGetNotes}
        />
      )}
    </>
  );
}
