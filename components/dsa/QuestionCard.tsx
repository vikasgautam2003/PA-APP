"use client";

import type { DSAQuestionWithProgress } from "@/types";

interface Props {
  question: DSAQuestionWithProgress;
  onStatusChange: (id: number, status: "todo" | "solving" | "done") => void;
}

const CYCLE: Record<string, "todo" | "solving" | "done"> = {
  todo: "solving", solving: "done", done: "todo",
};

const DIFF: Record<string, { color: string; bg: string }> = {
  Easy:   { color: "#16a34a", bg: "#f0fdf4" },
  Medium: { color: "#d97706", bg: "#fffbeb" },
  Hard:   { color: "#dc2626", bg: "#fef2f2" },
};

export default function QuestionCard({ question, onStatusChange }: Props) {
  const { id, title, topic, difficulty, link, status } = question;
  const diff = DIFF[difficulty] ?? DIFF.Medium;
  const done = status === "done";
  const solving = status === "solving";

  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 14px",
        border: `1px solid ${done ? "#bbf7d0" : "#f0f0f0"}`,
        borderRadius: 10,
        background: done ? "#f0fdf4" : "#fff",
        transition: "border-color 0.15s, background 0.15s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        if (!done) (e.currentTarget as HTMLElement).style.borderColor = "#e0e0e0";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = done ? "#bbf7d0" : "#f0f0f0";
      }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onStatusChange(id, CYCLE[status])}
        style={{
          width: 18, height: 18, borderRadius: 5, flexShrink: 0,
          border: `1.5px solid ${done ? "#16a34a" : solving ? "#d97706" : "#d1d5db"}`,
          background: done ? "#16a34a" : solving ? "#fffbeb" : "#fff",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s",
        }}
      >
        {done && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {solving && <div style={{ width: 7, height: 7, borderRadius: 2, background: "#d97706" }} />}
      </button>

      {/* Number */}
      <span style={{ fontSize: 11, color: "#c4c4c4", width: 32, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
        #{id}
      </span>

      {/* Title */}
      <span style={{
        flex: 1, fontSize: 13, fontWeight: 450,
        color: done ? "#9ca3af" : "#111827",
        textDecoration: done ? "line-through" : "none",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {title}
      </span>

      {/* Topic */}
      <span style={{
        fontSize: 11, color: "#9ca3af",
        background: "#f9f9f9",
        padding: "2px 8px", borderRadius: 99,
        border: "1px solid #f0f0f0",
        maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        flexShrink: 0,
      }}>
        {topic}
      </span>

      {/* Difficulty */}
      <span style={{
        fontSize: 11, fontWeight: 500,
        color: diff.color, background: diff.bg,
        padding: "2px 8px", borderRadius: 99,
        flexShrink: 0,
      }}>
        {difficulty}
      </span>

      {/* Link */}
      {link && (
        <a
          href={link} target="_blank" rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{ fontSize: 12, color: "#c4c4c4", textDecoration: "none", flexShrink: 0 }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#2563eb")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#c4c4c4")}
        >↗</a>
      )}
    </div>
  );
}