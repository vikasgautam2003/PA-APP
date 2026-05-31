"use client";

import type { CourseMeta } from "./courses";
import type { CourseProgressSummary } from "./useCourseProgress";

interface Props {
  course: CourseMeta;
  progress: CourseProgressSummary;
  onOpen: () => void;
  delayMs?: number;
}

// Per-course brand accent. Used sparingly — a small icon tile, the progress
// line, and a few text accents. No full-bleed hero / photo block.
const CARD_THEME: Record<CourseMeta["id"], { brand: string; brandSoft: string }> = {
  aws: { brand: "#FF9900", brandSoft: "rgba(255, 153, 0, 0.14)" },
  "github-actions": { brand: "#3FB950", brandSoft: "rgba(63, 185, 80, 0.14)" },
  "git-github": { brand: "#2188FF", brandSoft: "rgba(33, 136, 255, 0.14)" },
  "ai-engineer": { brand: "#A855F7", brandSoft: "rgba(168, 85, 247, 0.14)" },
};

const COURSE_MARK: Record<CourseMeta["id"], string> = {
  aws: "AWS",
  "github-actions": "GHA",
  "git-github": "GIT",
  "ai-engineer": "AI",
};

export default function CourseCard({ course, progress, onOpen, delayMs = 0 }: Props) {
  const theme = CARD_THEME[course.id];
  const pct = progress.pct;
  const done = pct === 100;
  const notStarted = pct === 0;
  const mark = COURSE_MARK[course.id];

  const statusLabel = done ? "Completed" : notStarted ? "New" : "In progress";
  const statusColor = done ? "var(--easy)" : theme.brand;

  return (
    <button
      onClick={onOpen}
      style={{
        display: "flex", flexDirection: "column",
        textAlign: "left",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        alignItems: "stretch",
        padding: "28px 28px 0",
        transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
        animation: `fde-fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${delayMs}ms backwards`,
        position: "relative",
        gap: 20,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.borderColor = "var(--text-faint)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.28)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Top row — icon tile + status */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 44, height: 44,
          borderRadius: 11,
          background: theme.brandSoft,
          border: `1px solid ${theme.brand}40`,
          color: theme.brand,
          fontSize: 13, fontWeight: 800, letterSpacing: "-0.02em",
          fontFamily: "ui-monospace, Menlo, monospace",
        }}>
          {mark}
        </div>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "4px 10px", borderRadius: 999,
          background: done ? "var(--easy-bg)" : theme.brandSoft,
          color: statusColor,
          fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}>
          {done && "✓ "}{statusLabel}
        </span>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <p style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.16em",
          color: theme.brand,
          textTransform: "uppercase",
        }}>
          {course.tagline}
        </p>
        <h3 style={{
          fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em",
          color: "var(--text-primary)",
          lineHeight: 1.25,
        }}>
          {course.title}
        </h3>
        <p style={{
          fontSize: 13, lineHeight: 1.6,
          color: "var(--text-muted)",
          display: "-webkit-box",
          WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {course.description}
        </p>
      </div>

      {/* Progress */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 12,
          fontSize: 11, fontWeight: 600,
          color: "var(--text-muted)",
          fontVariantNumeric: "tabular-nums",
        }}>
          <span>{course.units} {course.unitsLabel} · {course.durationLabel}</span>
          <span style={{ color: statusColor, fontWeight: 700 }}>
            {progress.done} / {progress.total} · {pct}%
          </span>
        </div>
        <div style={{
          height: 4, borderRadius: 999,
          background: "var(--border-subtle)",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            borderRadius: 999,
            background: done ? "var(--easy)" : theme.brand,
            transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }} />
        </div>
      </div>

      {/* CTA footer */}
      <div style={{
        margin: "0 -28px",
        padding: "16px 28px",
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--bg-surface)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
          color: "var(--text-secondary)",
          textTransform: "uppercase",
        }}>
          {notStarted ? "Start course" : done ? "Review course" : "Continue"}
        </span>
        <span style={{ fontSize: 15, color: theme.brand, fontWeight: 700 }}>
          →
        </span>
      </div>
    </button>
  );
}
