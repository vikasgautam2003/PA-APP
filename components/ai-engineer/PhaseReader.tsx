"use client";

import { useEffect, useState } from "react";
import type { AiePhase, AieSection } from "@/types";

const TONE_THEME: Record<AieSection["tone"], { color: string; bg: string; icon: string; label: string }> = {
  intro:     { color: "var(--gha-blue)",   bg: "var(--gha-blue-soft)",       icon: "★", label: "WHY THIS MATTERS" },
  concepts:  { color: "var(--gha-cyan)",   bg: "rgba(57, 197, 207, 0.10)",   icon: "◇", label: "CORE CONCEPTS" },
  bullets:   { color: "var(--gha-blue)",   bg: "var(--gha-blue-soft)",       icon: "▸", label: "KEY POINTS" },
  table:     { color: "var(--gha-cyan)",   bg: "rgba(57, 197, 207, 0.10)",   icon: "▦", label: "REFERENCE TABLE" },
  tasks:     { color: "var(--gha-orange)", bg: "rgba(210, 153, 34, 0.10)",   icon: "✓", label: "HANDS-ON" },
  principle: { color: "var(--gha-purple)", bg: "var(--gha-purple-glow)",     icon: "✦", label: "PRINCIPLE" },
};

interface Props {
  phase: AiePhase;
  sectionIndex: number;
  onSectionChange: (idx: number) => void;
}

export default function PhaseReader({ phase, sectionIndex, onSectionChange }: Props) {
  const sections = phase.sections;
  const total = sections.length;
  const idx = Math.min(Math.max(sectionIndex, 0), Math.max(total - 1, 0));
  const section = sections[idx];
  const [anim, setAnim] = useState(0);

  useEffect(() => {
    setAnim((a) => a + 1);
  }, [idx, phase.num]);

  if (!section) return null;

  const theme = TONE_THEME[section.tone];
  const pct = total > 0 ? Math.round(((idx + 1) / total) * 100) : 0;

  return (
    <div style={{
      border: "1px solid var(--gha-border)",
      borderRadius: 16,
      background: "var(--gha-bg-elevated)",
      overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      {/* Progress bar */}
      <div style={{ position: "relative", height: 3, background: "var(--gha-border-mute)" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: "linear-gradient(90deg, var(--gha-blue), var(--gha-cyan))",
          transition: "width 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
          boxShadow: "0 0 10px var(--gha-blue-glow)",
        }} />
      </div>

      {/* Section dots */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 6,
        padding: "14px 22px 10px",
        borderBottom: "1px solid var(--gha-border-mute)",
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
                border: isCurrent ? `1px solid ${t.color}` : "1px solid var(--gha-border)",
                background: isCurrent ? t.bg : isPast ? "var(--gha-bg-surface)" : "transparent",
                color: isCurrent ? t.color : isPast ? "var(--gha-text)" : "var(--gha-text-faint)",
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
        key={`${phase.num}-${idx}-${anim}`}
        style={{
          padding: "26px 30px 28px",
          display: "flex", flexDirection: "column", gap: 18,
          animation: "gha-fade-up 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
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
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: theme.color, marginBottom: 3,
            }}>
              {theme.label} · Section {idx + 1} of {total}
            </p>
            <h3 style={{
              fontSize: 21, fontWeight: 700,
              color: "var(--gha-text)",
              letterSpacing: "-0.02em", lineHeight: 1.2,
            }}>
              {section.label}
            </h3>
            {section.heading && (
              <p style={{
                fontSize: 13, fontWeight: 600, color: "var(--gha-text-muted)", marginTop: 3,
              }}>
                {section.heading}
              </p>
            )}
          </div>
        </div>

        {/* Plain body */}
        {section.body && (
          <div style={{
            fontSize: 15, lineHeight: 1.78,
            color: "var(--gha-text)",
            whiteSpace: "pre-wrap",
          }}>
            {renderInline(section.body)}
          </div>
        )}

        {/* Bullet list */}
        {section.bullets && section.bullets.length > 0 && (
          <ul style={{
            listStyle: "none", padding: 0, margin: 0,
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            {section.bullets.map((b, i) => (
              <li
                key={i}
                style={{
                  display: "flex", gap: 11,
                  padding: "11px 15px",
                  borderRadius: 10,
                  border: "1px solid var(--gha-border)",
                  background: "var(--gha-bg-surface)",
                  alignItems: "flex-start",
                  animation: `gha-fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) ${i * 25}ms backwards`,
                }}
              >
                <span style={{ color: theme.color, fontSize: 13, marginTop: 1, flexShrink: 0 }}>›</span>
                <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--gha-text)" }}>
                  {renderInline(b)}
                </p>
              </li>
            ))}
          </ul>
        )}

        {/* Concepts grid */}
        {section.concepts && section.concepts.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 12,
          }}>
            {section.concepts.map((c, i) => (
              <div
                key={i}
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: "1px solid var(--gha-cyan)",
                  background: "rgba(57, 197, 207, 0.06)",
                  animation: `gha-fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) ${i * 35}ms backwards`,
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--gha-cyan)", marginBottom: 6 }}>
                  {c.name}
                </p>
                <p style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--gha-text-muted)" }}>
                  {renderInline(c.body)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        {section.table && (
          <div style={{
            overflowX: "auto",
            border: "1px solid var(--gha-border)",
            borderRadius: 12,
          }}>
            <table style={{
              width: "100%", borderCollapse: "collapse",
              fontSize: 12.5, lineHeight: 1.5,
            }}>
              <thead>
                <tr>
                  {section.table.headers.map((h, i) => (
                    <th key={i} style={{
                      textAlign: "left", padding: "10px 14px",
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--gha-blue)",
                      background: "var(--gha-blue-soft)",
                      borderBottom: "1px solid var(--gha-border)",
                      whiteSpace: "nowrap",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.table.rows.map((row, ri) => (
                  <tr key={ri} style={{ background: ri % 2 ? "var(--gha-bg-surface)" : "transparent" }}>
                    {row.map((cell, ci) => (
                      <td key={ci} style={{
                        padding: "10px 14px",
                        color: ci === 0 ? "var(--gha-text)" : "var(--gha-text-muted)",
                        fontWeight: ci === 0 ? 600 : 400,
                        borderBottom: "1px solid var(--gha-border-mute)",
                        verticalAlign: "top",
                      }}>
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Hands-on tasks */}
        {section.tasks && section.tasks.length > 0 && (
          <ol style={{
            listStyle: "none", padding: 0, margin: 0,
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            {section.tasks.map((t, i) => (
              <li
                key={i}
                style={{
                  display: "flex", gap: 12,
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "1px solid var(--gha-border)",
                  background: "var(--gha-bg-surface)",
                  alignItems: "flex-start",
                }}
              >
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 24, height: 24, borderRadius: 7,
                  background: "var(--gha-orange)", color: "#0d1117",
                  fontSize: 11, fontWeight: 700,
                  flexShrink: 0, marginTop: 1,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {i + 1}
                </span>
                <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--gha-text)" }}>
                  {renderInline(t)}
                </p>
              </li>
            ))}
          </ol>
        )}

        {/* Code block */}
        {section.code && (
          <pre style={{
            margin: 0, padding: "16px 18px", borderRadius: 12,
            background: "var(--gha-bg)", border: "1px solid var(--gha-border)",
            color: "#e6edf3", fontSize: 12.5, lineHeight: 1.65,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            overflowX: "auto",
          }}>
            <code>{section.code.source}</code>
          </pre>
        )}

        {/* Study sources */}
        {section.sources && section.sources.length > 0 && (
          <div style={{
            padding: "14px 18px", borderRadius: 12,
            background: "var(--gha-bg-surface)",
            border: "1px solid var(--gha-border)",
          }}>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
              textTransform: "uppercase", color: "var(--gha-green)", marginBottom: 10,
            }}>
              ◆ Primary study sources
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {section.sources.map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "baseline", gap: 8,
                    fontSize: 13, color: "var(--gha-blue)",
                    textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}
                >
                  <span style={{ color: "var(--gha-text-faint)", flexShrink: 0 }}>→</span>
                  <span style={{ fontWeight: 600 }}>{s.label}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Nav footer */}
      <div style={{
        padding: "16px 30px 22px",
        borderTop: "1px solid var(--gha-border-mute)",
        background: "var(--gha-bg-surface)",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      }}>
        <button
          onClick={() => onSectionChange(Math.max(idx - 1, 0))}
          disabled={idx === 0}
          style={{
            padding: "9px 18px", borderRadius: 999,
            border: "1px solid var(--gha-border)",
            background: "transparent",
            color: idx === 0 ? "var(--gha-text-faint)" : "var(--gha-text-muted)",
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
          color: "var(--gha-text-faint)",
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
              ? "var(--gha-bg)"
              : "linear-gradient(135deg, var(--gha-blue), var(--gha-blue-dim))",
            color: idx >= total - 1 ? "var(--gha-text-faint)" : "#fff",
            fontSize: 12.5, fontWeight: 700, letterSpacing: "0.06em",
            cursor: idx >= total - 1 ? "not-allowed" : "pointer",
            boxShadow: idx >= total - 1 ? "none" : "0 6px 20px var(--gha-blue-glow)",
            transition: "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          onMouseEnter={(e) => {
            if (idx < total - 1) e.currentTarget.style.transform = "translateY(-2px) scale(1.03)";
          }}
          onMouseLeave={(e) => {
            if (idx < total - 1) e.currentTarget.style.transform = "translateY(0) scale(1)";
          }}
        >
          {idx >= total - 1 ? "Complete ✓" : "Next →"}
        </button>
      </div>
    </div>
  );
}

// Render markdown-lite inline: **bold** and `code`
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
        boldMatch?.index !== undefined &&
        (codeMatch?.index === undefined || boldMatch.index < codeMatch.index)
          ? "bold"
          : codeMatch?.index !== undefined
          ? "code"
          : null;

      if (first === "bold" && boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) parts.push(remaining.slice(0, boldMatch.index));
        parts.push(
          <strong key={`b-${lineIdx}-${i++}`} style={{ fontWeight: 700, color: "var(--gha-blue)" }}>
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      } else if (first === "code" && codeMatch && codeMatch.index !== undefined) {
        if (codeMatch.index > 0) parts.push(remaining.slice(0, codeMatch.index));
        parts.push(
          <code
            key={`c-${lineIdx}-${i++}`}
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "0.9em",
              background: "var(--gha-blue-soft)",
              color: "var(--gha-blue)",
              padding: "1.5px 6px",
              borderRadius: 5,
              border: "1px solid var(--gha-border)",
            }}
          >
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
