"use client";

import { useEffect, useState } from "react";
import type { AwsDay, AwsSection } from "@/types";

const TONE_THEME: Record<AwsSection["tone"], { color: string; bg: string; icon: string; label: string }> = {
  intro:   { color: "#60a5fa", bg: "rgba(96,165,250,0.10)", icon: "✦", label: "INTRO" },
  concept: { color: "#34d399", bg: "rgba(52,211,153,0.10)", icon: "▸", label: "CONCEPT" },
  config:  { color: "var(--aws-orange)", bg: "var(--aws-orange-soft)", icon: "⚙", label: "CONFIG" },
  cli:     { color: "var(--aws-orange)", bg: "var(--aws-orange-soft)", icon: "$", label: "CLI" },
  project: { color: "#a855f7", bg: "rgba(168,85,247,0.10)", icon: "✚", label: "MINI-PROJECT" },
  trap:    { color: "#fbbf24", bg: "rgba(251,191,36,0.10)", icon: "⚠", label: "EXAM TRAPS" },
  compare: { color: "#22d3ee", bg: "rgba(34,211,238,0.10)", icon: "≡", label: "COMPARE" },
  real:    { color: "#10b981", bg: "rgba(16,185,129,0.10)", icon: "◉", label: "REAL-WORLD" },
};

interface Props {
  day: AwsDay;
  sectionIndex: number;
  onSectionChange: (idx: number) => void;
}

export default function LessonReader({ day, sectionIndex, onSectionChange }: Props) {
  const sections = day.sections ?? [];
  const total = sections.length;
  const idx = Math.min(Math.max(sectionIndex, 0), Math.max(total - 1, 0));
  const section = sections[idx];
  const [anim, setAnim] = useState(0);

  useEffect(() => {
    setAnim((a) => a + 1);
  }, [idx, day.day]);

  if (!section) return null;

  const theme = TONE_THEME[section.tone];
  const pct = total > 0 ? Math.round(((idx + 1) / total) * 100) : 0;

  return (
    <div style={{
      border: "1px solid var(--border)",
      borderRadius: 18,
      background: "var(--bg-elevated)",
      overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      {/* Progress bar */}
      <div style={{ position: "relative", height: 4, background: "var(--border)" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: "linear-gradient(90deg, var(--aws-orange), #ffb84d)",
          transition: "width 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
          boxShadow: "0 0 10px var(--aws-orange-glow)",
        }} />
      </div>

      {/* Section dots — clickable nav */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 6,
        padding: "14px 24px 8px",
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        {sections.map((sec, i) => {
          const isCurrent = i === idx;
          const isPast = i < idx;
          const t = TONE_THEME[sec.tone];
          return (
            <button
              key={sec.id + i}
              onClick={() => onSectionChange(i)}
              title={sec.label}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 11px",
                borderRadius: 999,
                border: isCurrent ? `1px solid ${t.color}` : "1px solid var(--border)",
                background: isCurrent ? t.bg : isPast ? "var(--bg-surface)" : "transparent",
                color: isCurrent ? t.color : isPast ? "var(--text-secondary)" : "var(--text-faint)",
                fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <span style={{ fontSize: 11 }}>{isPast ? "✓" : t.icon}</span>
              <span>{String(i + 1).padStart(2, "0")}</span>
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div
        key={`${day.day}-${idx}-${anim}`}
        style={{
          padding: "26px 32px 28px",
          display: "flex", flexDirection: "column", gap: 18,
          animation: "aws-fade-up 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 36, height: 36, borderRadius: 10,
            background: theme.bg, color: theme.color,
            fontSize: 16, fontWeight: 700,
            border: `1px solid ${theme.color}`,
          }}>
            {theme.icon}
          </span>
          <div>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: theme.color, marginBottom: 3,
            }}>
              {theme.label} · Section {idx + 1} of {total}
            </p>
            <h3 style={{
              fontSize: 22, fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em", lineHeight: 1.2,
            }}>
              {section.label}
            </h3>
          </div>
        </div>

        {section.body && (
          <div style={{
            fontSize: 15, lineHeight: 1.78,
            color: "var(--text-primary)",
            whiteSpace: "pre-wrap",
          }}>
            {renderInline(section.body)}
          </div>
        )}

        {section.table && (
          <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid var(--border)" }}>
            <table style={{
              width: "100%", borderCollapse: "collapse",
              fontSize: 13.5,
            }}>
              <thead>
                <tr style={{ background: "var(--aws-orange-soft)" }}>
                  {section.table.headers.map((h) => (
                    <th key={h} style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      color: "var(--aws-orange)",
                      fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      borderBottom: "1px solid var(--aws-orange)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.table.rows.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "var(--bg-surface)" }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{
                        padding: "10px 14px",
                        borderTop: i > 0 ? "1px solid var(--border-subtle)" : undefined,
                        color: "var(--text-primary)",
                        lineHeight: 1.55,
                      }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {section.code && (
          <pre style={{
            margin: 0,
            padding: "16px 18px",
            borderRadius: 12,
            background: "var(--aws-pdf-bg)",
            border: "1px solid var(--aws-navy)",
            color: "#e6edf3",
            fontSize: 12.5, lineHeight: 1.65,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            overflowX: "auto",
            boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              marginBottom: 10, paddingBottom: 8,
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f56" }} />
              <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e" }} />
              <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#27c93f" }} />
              <span style={{
                marginLeft: "auto",
                fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
                color: "var(--aws-orange)",
                textTransform: "uppercase",
              }}>
                {section.code.lang}
              </span>
            </div>
            <code>{section.code.source}</code>
          </pre>
        )}
      </div>

      {/* Nav footer */}
      <div style={{
        padding: "16px 32px 22px",
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--bg-surface)",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      }}>
        <button
          onClick={() => onSectionChange(Math.max(idx - 1, 0))}
          disabled={idx === 0}
          style={{
            padding: "9px 18px", borderRadius: 999,
            border: "1px solid var(--border)",
            background: "transparent",
            color: idx === 0 ? "var(--text-faint)" : "var(--text-secondary)",
            fontSize: 12, fontWeight: 600, letterSpacing: "0.04em",
            cursor: idx === 0 ? "not-allowed" : "pointer",
            opacity: idx === 0 ? 0.5 : 1,
            transition: "all 0.2s",
          }}
        >
          ← Previous
        </button>

        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
          color: "var(--text-muted)",
          fontVariantNumeric: "tabular-nums",
          textTransform: "uppercase",
        }}>
          {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>

        <button
          onClick={() => onSectionChange(Math.min(idx + 1, total - 1))}
          disabled={idx >= total - 1}
          style={{
            padding: "10px 24px", borderRadius: 999, border: "none",
            background: idx >= total - 1
              ? "var(--bg-hover)"
              : "linear-gradient(135deg, var(--aws-orange), var(--aws-orange-dim))",
            color: idx >= total - 1 ? "var(--text-faint)" : "#fff",
            fontSize: 12.5, fontWeight: 700, letterSpacing: "0.06em",
            cursor: idx >= total - 1 ? "not-allowed" : "pointer",
            boxShadow: idx >= total - 1 ? "none" : "0 6px 20px var(--aws-orange-glow)",
            transition: "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          onMouseEnter={(e) => {
            if (idx < total - 1) e.currentTarget.style.transform = "translateY(-2px) scale(1.03)";
          }}
          onMouseLeave={(e) => {
            if (idx < total - 1) e.currentTarget.style.transform = "translateY(0) scale(1)";
          }}
        >
          {idx >= total - 1 ? "Section complete ✓" : "Next →"}
        </button>
      </div>
    </div>
  );
}

// Render markdown-lite inline: **bold**, `code`, line breaks
function renderInline(text: string): React.ReactNode {
  const lines = text.split("\n");
  return lines.map((line, lineIdx) => {
    if (line.trim() === "") {
      return <br key={`br-${lineIdx}`} />;
    }
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let i = 0;
    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
      const codeMatch = remaining.match(/`([^`]+)`/);
      const first =
        (boldMatch?.index !== undefined && (codeMatch?.index === undefined || boldMatch.index < codeMatch.index))
          ? "bold"
          : codeMatch?.index !== undefined
          ? "code"
          : null;

      if (first === "bold" && boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) parts.push(remaining.slice(0, boldMatch.index));
        parts.push(
          <strong key={`b-${lineIdx}-${i++}`} style={{ fontWeight: 700, color: "var(--aws-orange)" }}>
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      } else if (first === "code" && codeMatch && codeMatch.index !== undefined) {
        if (codeMatch.index > 0) parts.push(remaining.slice(0, codeMatch.index));
        parts.push(
          <code key={`c-${lineIdx}-${i++}`} style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: "0.92em",
            background: "var(--aws-orange-soft)",
            color: "var(--aws-orange)",
            padding: "1.5px 6px",
            borderRadius: 5,
          }}>
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch.index + codeMatch[0].length);
      } else {
        parts.push(remaining);
        remaining = "";
      }
    }
    return (
      <span key={`l-${lineIdx}`} style={{ display: "block" }}>
        {parts}
      </span>
    );
  });
}
