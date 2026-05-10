"use client";

import { useState, useEffect, useRef } from "react";
import type { FdeDay, FdeDayProgress } from "@/types";
import { getCapstone, getMonthMeta } from "@/lib/fde-roadmap";

function formatDayAsMarkdown(day: FdeDay): string {
  const month = getMonthMeta(day.month);
  const cap = day.kind === "capstone" ? getCapstone(day.month) : null;
  const lines: string[] = [];

  lines.push(`# Day ${day.day} — Month ${day.month}, Week ${day.weekInMonth}`);
  if (month) lines.push(`_${month.title} — ${month.tagline}_`);
  lines.push("");

  if (day.kind === "lesson") {
    if (day.topic) lines.push(`## Topic\n${day.topic}`);
    if (day.task) lines.push(`\n## Today's task\n${day.task}`);
    if (day.depth) lines.push(`\n**Depth:** ${day.depth}`);
    if (day.source) lines.push(`**Source:** ${day.source}`);
    if (day.whyMatters) lines.push(`\n## Why this matters\n${day.whyMatters}`);
    if (day.howToDoIt) lines.push(`\n## How to do it\n${day.howToDoIt}`);
    if (day.watchOutFor) lines.push(`\n## Watch out for\n${day.watchOutFor}`);
    if (day.doneWhen) lines.push(`\n## Done when\n${day.doneWhen}`);
  } else if (day.kind === "rest") {
    lines.push("## Rest day\nNo DSA. No task. Deliberate recovery.");
  } else if (day.kind === "capstone" && cap) {
    lines.push(`## ${cap.name} — ${cap.tagline}`);
    lines.push(`\n${cap.summary}`);
    lines.push(`\n**Stack:** ${cap.stack.join(", ")}`);
    lines.push(`\n## Build phases`);
    for (const p of cap.buildPhases) lines.push(`- **${p.range}** — ${p.description}`);
    lines.push(`\n## Engineering challenges`);
    for (const c of cap.challenges) lines.push(`- ${c}`);
    lines.push(`\n## Outcome\n${cap.outcome}`);
  }

  if (day.dsa) {
    lines.push(`\n## DSA (${day.dsa.tier})`);
    lines.push(`**${day.dsa.title}** — approach: ${day.dsa.approach}`);
  }

  return lines.join("\n");
}

const TIER_COLOR: Record<string, string> = {
  Easy: "var(--easy)",
  Medium: "var(--medium)",
  Hard: "var(--hard)",
};
const TIER_BG: Record<string, string> = {
  Easy: "var(--easy-bg)",
  Medium: "var(--medium-bg)",
  Hard: "var(--hard-bg)",
};

function tierColor(tier?: string): string {
  if (!tier) return "var(--text-muted)";
  if (tier.startsWith("Easy")) return TIER_COLOR.Easy;
  if (tier.startsWith("Medium")) return TIER_COLOR.Medium;
  if (tier.startsWith("Hard")) return TIER_COLOR.Hard;
  return "var(--text-muted)";
}
function tierBg(tier?: string): string {
  if (!tier) return "var(--bg-elevated)";
  if (tier.startsWith("Easy")) return TIER_BG.Easy;
  if (tier.startsWith("Medium")) return TIER_BG.Medium;
  if (tier.startsWith("Hard")) return TIER_BG.Hard;
  return "var(--bg-elevated)";
}

const SECTION_COLORS = {
  why:   { color: "#60a5fa", bg: "rgba(96,165,250,0.10)", icon: "✦" },   // blue
  how:   { color: "#34d399", bg: "rgba(52,211,153,0.10)", icon: "▸" },   // green
  watch: { color: "#fbbf24", bg: "rgba(251,191,36,0.10)", icon: "⚠" },   // amber
  done:  { color: "#a855f7", bg: "rgba(168,85,247,0.10)", icon: "✓" },   // purple
} as const;

interface CollapsibleProps {
  label: string;
  body: string;
  tone: keyof typeof SECTION_COLORS;
  defaultOpen?: boolean;
}

function Collapsible({ label, body, tone, defaultOpen = false }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  const ref = useRef<HTMLDivElement>(null);
  const c = SECTION_COLORS[tone];
  return (
    <div style={{
      border: "1px solid var(--border)",
      borderRadius: 12,
      background: "var(--bg-surface)",
      overflow: "hidden",
      transition: "border-color 0.25s, box-shadow 0.25s",
      borderColor: open ? c.color : "var(--border)",
      boxShadow: open ? `0 0 0 3px ${c.bg}` : "none",
    }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%", padding: "14px 18px",
          background: "transparent", border: "none",
          cursor: "pointer", textAlign: "left",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 22, height: 22, borderRadius: 6,
            background: c.bg, color: c.color,
            fontSize: 12, fontWeight: 700, flexShrink: 0,
            transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            transform: open ? "rotate(0deg) scale(1.05)" : "rotate(0deg) scale(1)",
          }}>
            {c.icon}
          </span>
          <span style={{
            fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
            textTransform: "uppercase", color: c.color,
          }}>
            {label}
          </span>
        </div>
        <span style={{
          fontSize: 14, color: c.color,
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          opacity: 0.7,
        }}>
          ⌄
        </span>
      </button>
      <div
        ref={ref}
        style={{
          maxHeight: open ? (ref.current?.scrollHeight ?? 800) : 0,
          overflow: "hidden",
          transition: "max-height 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <p style={{
          padding: "0 18px 18px",
          fontSize: 14, lineHeight: 1.75,
          color: "var(--text-primary)",
          opacity: open ? 1 : 0,
          transition: "opacity 0.3s ease",
          transitionDelay: open ? "0.1s" : "0s",
        }}>
          {body}
        </p>
      </div>
    </div>
  );
}

interface Props {
  day: FdeDay;
  progress: FdeDayProgress | undefined;
  onToggleTask: () => void;
  onToggleDsa: () => void;
  onSaveNotes: (notes: string) => void;
}

export default function DayCard({ day, progress, onToggleTask, onToggleDsa, onSaveNotes }: Props) {
  const [notes, setNotes] = useState(progress?.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setNotes(progress?.notes ?? "");
  }, [day.day, progress?.notes]);

  useEffect(() => {
    setCopied(false);
  }, [day.day]);

  async function copyDay() {
    try {
      await navigator.clipboard.writeText(formatDayAsMarkdown(day));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  const monthMeta = getMonthMeta(day.month);
  const cap = day.kind === "capstone" ? getCapstone(day.month) : null;
  const isRest = day.kind === "rest";
  const isCapstoneDay = day.kind === "capstone";
  const taskDone = !!progress?.taskDone;
  const dsaTier = day.dsa?.tier;

  const heading = isRest
    ? "Rest day"
    : isCapstoneDay
    ? cap?.name ?? "Capstone"
    : day.topic ?? "";

  const eyebrow = `Day ${String(day.day).padStart(2, "0")} · Month ${day.month} · Week ${day.weekInMonth}${
    isRest ? " · Rest" : isCapstoneDay ? " · Capstone" : ""
  }`;

  return (
    <article
      key={day.day}
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid",
        borderColor: isCapstoneDay ? "var(--accent)" : "var(--border)",
        borderRadius: 18,
        overflow: "hidden",
        animation: "fde-fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        boxShadow: isCapstoneDay ? "0 8px 36px var(--accent-glow)" : "none",
      }}
    >
      {/* Hero */}
      <header style={{
        padding: "32px 36px 28px",
        background: isCapstoneDay
          ? "linear-gradient(135deg, var(--accent-glow) 0%, transparent 70%)"
          : isRest
          ? "linear-gradient(135deg, var(--medium-bg) 0%, transparent 70%)"
          : "linear-gradient(135deg, rgba(96,165,250,0.08) 0%, transparent 70%)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24,
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: isCapstoneDay ? "var(--accent-text)" : isRest ? "var(--medium)" : "var(--accent-text)",
            marginBottom: 12,
          }}>
            {eyebrow}
          </p>
          <h2 style={{
            fontSize: 34, fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.025em", lineHeight: 1.1,
            marginBottom: monthMeta ? 8 : 0,
            background: isCapstoneDay
              ? "linear-gradient(135deg, var(--accent), #a855f7)"
              : "none",
            WebkitBackgroundClip: isCapstoneDay ? "text" : undefined,
            WebkitTextFillColor: isCapstoneDay ? "transparent" : undefined,
            backgroundClip: isCapstoneDay ? "text" : undefined,
          }}>
            {heading}
          </h2>
          {monthMeta && !isRest && (
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
              {monthMeta.title}
            </p>
          )}
          {isRest && (
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, marginTop: 8 }}>
              No DSA. No task. Deliberate recovery is part of the system.
            </p>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => void copyDay()}
            title="Copy this day as markdown"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "10px 14px", borderRadius: 999,
              border: "1px solid",
              borderColor: copied ? "var(--easy)" : "var(--border)",
              background: copied ? "var(--easy-bg)" : "var(--bg-surface)",
              color: copied ? "var(--easy)" : "var(--text-secondary)",
              fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
              cursor: "pointer", whiteSpace: "nowrap",
              transition: "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
              animation: copied ? "fde-celebrate 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" : undefined,
            }}
            onMouseEnter={(e) => {
              if (copied) return;
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.color = "var(--accent-text)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              if (copied) return;
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-secondary)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span style={{ fontSize: 12 }}>{copied ? "✓" : "⎘"}</span>
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={onToggleTask}
            style={{
              padding: "11px 22px", borderRadius: 999,
              border: "none",
              background: taskDone
                ? "linear-gradient(135deg, var(--easy), #34d399)"
                : "linear-gradient(135deg, var(--accent), #7c3aed)",
              color: "#fff",
              fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
              cursor: "pointer", whiteSpace: "nowrap",
              boxShadow: taskDone
                ? "0 6px 20px rgba(48,209,88,0.35)"
                : "0 6px 20px var(--accent-glow)",
              transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
              animation: taskDone ? "fde-celebrate 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" : undefined,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px) scale(1.03)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0) scale(1)"; }}
          >
            {taskDone ? "✓ Completed" : isRest ? "Mark rest taken" : isCapstoneDay ? "Mark capstone shipped" : "Mark task done"}
          </button>
        </div>
      </header>

      {/* Body */}
      <div style={{ padding: "26px 36px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Lesson body */}
        {day.kind === "lesson" && (
          <>
            {/* Today's task — always visible, prominent */}
            <div style={{
              padding: "16px 20px",
              borderRadius: 14,
              background: "linear-gradient(135deg, rgba(10,132,255,0.10) 0%, rgba(168,85,247,0.06) 100%)",
              border: "1px solid var(--accent)",
              boxShadow: "0 0 0 4px var(--accent-glow)",
            }}>
              <p style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
                textTransform: "uppercase", color: "var(--accent-text)",
                marginBottom: 8,
              }}>
                ✦ Today&apos;s task
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--text-primary)" }}>
                {day.task}
              </p>
            </div>

            {/* Depth + Source meta */}
            {(day.depth || day.source) && (
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14,
              }}>
                {day.depth && (
                  <MetaBlock label="Depth" body={day.depth} />
                )}
                {day.source && (
                  <MetaBlock label="Source" body={day.source} mono />
                )}
              </div>
            )}

            {/* Collapsible sections */}
            {day.whyMatters && <Collapsible label="Why this matters" body={day.whyMatters} tone="why" />}
            {day.howToDoIt && <Collapsible label="How to do it" body={day.howToDoIt} tone="how" />}
            {day.watchOutFor && <Collapsible label="Watch out for" body={day.watchOutFor} tone="watch" />}
            {day.doneWhen && <Collapsible label="Done when" body={day.doneWhen} tone="done" />}
          </>
        )}

        {/* Capstone body */}
        {isCapstoneDay && cap && (
          <>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--text-primary)" }}>
              {cap.summary}
            </p>

            <div>
              <p style={labelStyle}>Stack</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                {cap.stack.map((s) => (
                  <span key={s} style={{
                    fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 999,
                    color: "var(--accent-text)",
                    background: "var(--accent-glow)",
                    border: "1px solid var(--accent)",
                  }}>{s}</span>
                ))}
              </div>
            </div>

            <Collapsible
              label="Build phases"
              body={cap.buildPhases.map((p) => `${p.range} — ${p.description}`).join("\n\n")}
              tone="how"
              defaultOpen
            />
            <Collapsible
              label="Engineering challenges"
              body={cap.challenges.map((c, i) => `${i + 1}. ${c}`).join("\n")}
              tone="watch"
            />
            <div style={{
              padding: "14px 18px", borderRadius: 12,
              background: "linear-gradient(135deg, rgba(48,209,88,0.10) 0%, transparent 80%)",
              border: "1px solid var(--easy)",
            }}>
              <p style={{ ...labelStyle, color: "var(--easy)", marginBottom: 6 }}>Outcome</p>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--text-primary)" }}>{cap.outcome}</p>
            </div>
          </>
        )}

        {/* Rest body */}
        {isRest && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "Review the week — what clicked, what didn't, what you'd do differently.",
              "Read a chapter (Fluent Python · DDIA · System Design Interview).",
              "Take a walk — your brain consolidates learning during rest.",
              "Optional: a brief note about what you learned this week.",
            ].map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 22, height: 22, borderRadius: 6,
                  background: "var(--medium-bg)", color: "var(--medium)",
                  fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1,
                }}>
                  {i + 1}
                </span>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-primary)" }}>{line}</p>
              </div>
            ))}
          </div>
        )}

        {/* DSA */}
        {day.dsa && (
          <div style={{
            padding: "14px 18px", borderRadius: 14,
            background: tierBg(dsaTier),
            border: `1px solid ${tierColor(dsaTier)}`,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
            transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 999,
                  color: "#fff", background: tierColor(dsaTier),
                  letterSpacing: "0.08em",
                }}>
                  DSA · {day.dsa.tier.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>
                {day.dsa.title}
              </p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                {day.dsa.approach}
              </p>
            </div>
            <button
              onClick={onToggleDsa}
              style={{
                padding: "9px 18px", borderRadius: 999, border: "none",
                background: progress?.dsaDone
                  ? "linear-gradient(135deg, var(--easy), #34d399)"
                  : tierColor(dsaTier),
                color: "#fff",
                fontSize: 11.5, fontWeight: 700, letterSpacing: "0.04em",
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                boxShadow: progress?.dsaDone
                  ? "0 4px 14px rgba(48,209,88,0.3)"
                  : `0 4px 14px ${tierColor(dsaTier)}40`,
                transition: "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
                animation: progress?.dsaDone ? "fde-celebrate 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" : undefined,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px) scale(1.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0) scale(1)"; }}
            >
              {progress?.dsaDone ? "✓ Solved" : "Mark solved"}
            </button>
          </div>
        )}

        {/* Notes */}
        <div style={{
          padding: "14px 18px", borderRadius: 12,
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
        }}>
          <p style={{ ...labelStyle, marginBottom: 8 }}>Notes</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What clicked? What broke? What did you ship?"
            rows={3}
            style={{
              width: "100%", padding: "8px 0",
              border: "none", borderBottom: "1px solid var(--border)",
              fontSize: 13.5, color: "var(--text-primary)",
              background: "transparent",
              outline: "none", resize: "vertical", lineHeight: 1.6,
              fontFamily: "inherit",
              transition: "border-color 0.18s",
            }}
            onFocus={(e) => { e.target.style.borderBottomColor = "var(--accent)"; }}
            onBlur={(e) => { e.target.style.borderBottomColor = "var(--border)"; }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button
              onClick={async () => { setSavingNotes(true); await onSaveNotes(notes); setSavingNotes(false); }}
              disabled={savingNotes}
              style={{
                padding: "6px 14px", borderRadius: 999,
                border: "1px solid var(--border)",
                background: "transparent",
                fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
                color: savingNotes ? "var(--text-faint)" : "var(--text-secondary)",
                textTransform: "uppercase", cursor: savingNotes ? "not-allowed" : "pointer",
                transition: "all 0.18s",
              }}
            >
              {savingNotes ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Capstone progress footer (lessons only) */}
      {day.kind === "lesson" && (
        <footer style={{
          padding: "14px 36px",
          borderTop: "1px solid var(--border-subtle)",
          background: "var(--bg-surface)",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-faint)", whiteSpace: "nowrap" }}>
            M{day.month} capstone
          </span>
          <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${day.capstoneProgress}%`,
              background: "linear-gradient(90deg, var(--accent), #a855f7)",
              borderRadius: 99,
              transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
              boxShadow: "0 0 8px var(--accent-glow)",
            }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-text)", fontVariantNumeric: "tabular-nums", minWidth: 32, textAlign: "right" }}>
            {day.capstoneProgress}%
          </span>
        </footer>
      )}
    </article>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
  textTransform: "uppercase", color: "var(--text-muted)",
};

function MetaBlock({ label, body, mono }: { label: string; body: string; mono?: boolean }) {
  return (
    <div style={{
      padding: "12px 16px", borderRadius: 12,
      border: "1px solid var(--border)", background: "var(--bg-surface)",
    }}>
      <p style={{ ...labelStyle, marginBottom: 6 }}>{label}</p>
      <p style={{
        fontSize: 12.5, lineHeight: 1.55,
        color: "var(--text-secondary)",
        fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : "inherit",
        wordBreak: "break-word",
      }}>{body}</p>
    </div>
  );
}
