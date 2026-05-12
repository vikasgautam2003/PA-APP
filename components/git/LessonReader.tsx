"use client";

import type { GitChapter, GitSection } from "@/types";

const TONE_META: Record<GitSection["tone"], { icon: string; label: string }> = {
  intro:     { icon: "✦", label: "WHY" },
  concepts:  { icon: "▣", label: "CONCEPTS" },
  commands:  { icon: "$", label: "COMMANDS" },
  scenario:  { icon: "▶", label: "REAL SCENARIO" },
  traps:     { icon: "⚠", label: "TRAPS — READ THESE" },
  principle: { icon: "✧", label: "PRINCIPLE" },
};

interface Props {
  chapter: GitChapter;
  sectionIndex: number;
  onSectionChange: (idx: number) => void;
}

export default function LessonReader({ chapter, sectionIndex, onSectionChange }: Props) {
  const sections = chapter.sections;
  const total = sections.length;
  const idx = Math.min(Math.max(sectionIndex, 0), Math.max(total - 1, 0));
  const section = sections[idx];

  if (!section) return null;

  const meta = TONE_META[section.tone];
  const pct = total > 0 ? Math.round(((idx + 1) / total) * 100) : 0;
  const accent = chapter.accentColor;
  const accentSoft = `${accent}1a`;
  const accentBorder = `${accent}55`;

  return (
    <div style={{
      border: "1px solid var(--gha-border)",
      borderRadius: 18,
      background: "var(--gha-bg-elevated)",
      overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ position: "relative", height: 4, background: "var(--gha-border)" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: `linear-gradient(90deg, ${accent}, var(--gha-cyan))`,
          transition: "width 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
          boxShadow: `0 0 10px ${accent}66`,
        }} />
      </div>

      <div style={{
        display: "flex", flexWrap: "wrap", gap: 6,
        padding: "14px 24px 8px",
        borderBottom: "1px solid var(--gha-border-mute)",
      }}>
        {sections.map((sec, i) => {
          const isCurrent = i === idx;
          const isPast = i < idx;
          const t = TONE_META[sec.tone];
          return (
            <button
              key={sec.id + i}
              onClick={() => onSectionChange(i)}
              title={sec.label}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 11px",
                borderRadius: 999,
                border: isCurrent ? `1px solid ${accent}` : "1px solid var(--gha-border)",
                background: isCurrent ? accentSoft : isPast ? "var(--gha-bg-surface)" : "transparent",
                color: isCurrent ? accent : isPast ? "var(--gha-text)" : "var(--gha-text-faint)",
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

      <div
        key={`${chapter.num}-${idx}`}
        style={{
          padding: "26px 32px 28px",
          display: "flex", flexDirection: "column", gap: 18,
          animation: "gha-fade-up 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 36, height: 36, borderRadius: 10,
            background: accentSoft, color: accent,
            fontSize: 16, fontWeight: 700,
            border: `1px solid ${accentBorder}`,
          }}>
            {meta.icon}
          </span>
          <div>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: accent, marginBottom: 3,
            }}>
              {meta.label} · Section {idx + 1} of {total}
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
            {renderInline(section.body, accent)}
          </div>
        )}

        {section.concepts && section.concepts.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 12,
          }}>
            {section.concepts.map((c, i) => (
              <div key={i} style={{
                padding: "14px 16px",
                borderRadius: 12,
                border: `1px solid ${accentBorder}`,
                background: accentSoft,
              }}>
                <h4 style={{
                  fontSize: 13, fontWeight: 700,
                  color: accent,
                  letterSpacing: "-0.01em",
                  marginBottom: 6,
                }}>
                  {c.name}
                </h4>
                <p style={{
                  fontSize: 12.5, lineHeight: 1.55,
                  color: "var(--text-primary)",
                }}>
                  {renderInline(c.body, accent)}
                </p>
              </div>
            ))}
          </div>
        )}

        {section.commands && section.commands.length > 0 && (
          <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid var(--gha-border)" }}>
            <table style={{
              width: "100%", borderCollapse: "collapse",
              fontSize: 13.5,
            }}>
              <thead>
                <tr style={{ background: accentSoft }}>
                  <th style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    color: accent,
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    borderBottom: `1px solid ${accent}`,
                    width: "40%",
                  }}>Command</th>
                  <th style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    color: accent,
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    borderBottom: `1px solid ${accent}`,
                  }}>When to use</th>
                </tr>
              </thead>
              <tbody>
                {section.commands.map((cmd, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "var(--gha-bg-surface)" }}>
                    <td style={{
                      padding: "10px 14px",
                      borderTop: i > 0 ? "1px solid var(--gha-border-mute)" : undefined,
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                      fontSize: 12.5,
                      color: accent,
                      lineHeight: 1.55,
                      whiteSpace: "nowrap",
                      overflowX: "auto",
                    }}>{cmd.command}</td>
                    <td style={{
                      padding: "10px 14px",
                      borderTop: i > 0 ? "1px solid var(--gha-border-mute)" : undefined,
                      color: "var(--text-primary)",
                      lineHeight: 1.55,
                    }}>{renderInline(cmd.when, accent)}</td>
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
            background: "var(--gha-bg)",
            border: "1px solid var(--gha-border)",
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
                color: accent,
                textTransform: "uppercase",
              }}>
                {section.code.lang}
              </span>
            </div>
            <code>{section.code.source}</code>
          </pre>
        )}

        {section.traps && section.traps.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {section.traps.map((trap, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "12px 16px",
                borderRadius: 12,
                background: "rgba(248,81,73,0.08)",
                border: "1px solid var(--gha-red)",
              }}>
                <span style={{
                  flexShrink: 0, marginTop: 1,
                  width: 10, height: 10, borderRadius: 2,
                  background: "var(--gha-red)",
                }} />
                <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--text-primary)" }}>
                  {renderInline(trap, "var(--gha-red)")}
                </p>
              </div>
            ))}
          </div>
        )}

        {section.tone === "principle" && section.body && (
          <div style={{
            padding: "14px 18px",
            borderRadius: 12,
            background: "rgba(163,113,247,0.08)",
            border: "1px solid var(--gha-purple)",
          }}>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--gha-purple)",
              marginBottom: 6,
            }}>
              ★ Principle
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-primary)", fontWeight: 600 }}>
              {renderInline(section.body, "var(--gha-purple)")}
            </p>
          </div>
        )}
      </div>

      <div style={{
        padding: "16px 32px 22px",
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
            color: idx === 0 ? "var(--gha-text-faint)" : "var(--gha-text)",
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
          color: "var(--gha-text-muted)",
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
              ? "var(--gha-bg-surface)"
              : `linear-gradient(135deg, ${accent}, var(--gha-cyan))`,
            color: idx >= total - 1 ? "var(--gha-text-faint)" : "#0d1117",
            fontSize: 12.5, fontWeight: 700, letterSpacing: "0.06em",
            cursor: idx >= total - 1 ? "not-allowed" : "pointer",
            boxShadow: idx >= total - 1 ? "none" : `0 6px 18px ${accent}55`,
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

// Inline markdown-lite: **bold**, `code`, line breaks
function renderInline(text: string, accent: string): React.ReactNode {
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
          <strong key={`b-${lineIdx}-${i++}`} style={{ fontWeight: 700, color: accent }}>
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
            background: `${accent}1a`,
            color: accent,
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
