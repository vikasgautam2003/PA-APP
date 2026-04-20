"use client";

import type { DSAQuestionWithProgress } from "@/types";

interface Props {
  question: DSAQuestionWithProgress;
  onStatusChange: (id: number, status: "todo" | "solving" | "done") => void;
}

const CYCLE: Record<string, "todo" | "solving" | "done"> = {
  todo: "solving", solving: "done", done: "todo",
};

export default function QuestionCard({ question, onStatusChange }: Props) {
  const { id, title, topic, difficulty, link, status } = question;
  const done = status === "done";
  const solving = status === "solving";

  const diffColor = difficulty === "Easy" ? "var(--easy)" : difficulty === "Medium" ? "var(--medium)" : "var(--hard)";
  const diffBg = difficulty === "Easy" ? "var(--easy-bg)" : difficulty === "Medium" ? "var(--medium-bg)" : "var(--hard-bg)";

  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "12px 18px",
        border: `1px solid ${done ? "var(--easy-bg)" : "var(--border)"}`,
        borderRadius: 12,
        background: done ? "var(--easy-bg)" : "var(--bg-elevated)",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        if (!done) (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = done ? "var(--easy-bg)" : "var(--bg-elevated)";
      }}
    >
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

      <span style={{ fontSize: 11, color: "var(--text-faint)", width: 34, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
        #{id}
      </span>

      <span style={{
        flex: 1, fontSize: 14, fontWeight: done ? 400 : 500,
        color: done ? "var(--text-muted)" : "var(--text-primary)",
        textDecoration: done ? "line-through" : "none",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        letterSpacing: "-0.01em",
      }}>
        {title}
      </span>

      <span style={{
        fontSize: 11, color: "var(--text-muted)",
        background: "var(--bg-hover)", padding: "3px 10px",
        borderRadius: 99, border: "1px solid var(--border)",
        maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis",
        whiteSpace: "nowrap", flexShrink: 0,
      }}>
        {topic}
      </span>

      <span style={{
        fontSize: 11, fontWeight: 600,
        color: diffColor, background: diffBg,
        padding: "3px 10px", borderRadius: 99, flexShrink: 0,
      }}>
        {difficulty}
      </span>

      {link && (
        <a href={link} target="_blank" rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{ fontSize: 13, color: "var(--text-faint)", textDecoration: "none", flexShrink: 0 }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--accent-text)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-faint)")}
        >↗</a>
      )}
    </div>
  );
}