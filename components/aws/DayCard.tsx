"use client";

import { useState, useEffect } from "react";
import type { AwsDay, AwsDayProgress } from "@/types";
import { getAwsPhaseMeta, getAwsCapstone } from "@/lib/aws-roadmap";
import LessonReader from "./LessonReader";

interface Props {
  day: AwsDay;
  progress: AwsDayProgress | undefined;
  onToggleTask: () => void;
  onSectionChange: (idx: number) => void;
  onSaveNotes: (notes: string) => void;
}

export default function DayCard({ day, progress, onToggleTask, onSectionChange, onSaveNotes }: Props) {
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
      const lines: string[] = [];
      lines.push(`# Day ${day.day} — ${day.topic ?? ""}`);
      if (day.task) lines.push(`\n## Today's task\n${day.task}`);
      if (day.whyMatters) lines.push(`\n## Why this matters\n${day.whyMatters}`);
      if (day.howToDoIt) lines.push(`\n## How to do it\n${day.howToDoIt}`);
      if (day.watchOutFor) lines.push(`\n## Watch out for\n${day.watchOutFor}`);
      if (day.doneWhen) lines.push(`\n## Done when\n${day.doneWhen}`);
      if (day.examTrap) lines.push(`\n## Exam trap\n${day.examTrap}`);
      if (day.realWorld) lines.push(`\n## Real-world\n${day.realWorld}`);
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  const phaseMeta = getAwsPhaseMeta(day.phase);
  const cap = day.kind === "capstone" ? getAwsCapstone(day.phase) : null;
  const isReview = day.kind === "review";
  const isCapstoneDay = day.kind === "capstone";
  const taskDone = !!progress?.taskDone;

  const heading = isReview
    ? "Phase review"
    : isCapstoneDay
    ? cap?.name ?? "Capstone"
    : day.topic ?? "";

  const eyebrow = `Day ${String(day.day).padStart(2, "0")} · Phase ${day.phase} · Week ${day.weekInPhase}${
    isReview ? " · Review" : isCapstoneDay ? " · Capstone" : ""
  }`;

  return (
    <article
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid",
        borderColor: isCapstoneDay ? "var(--aws-orange)" : "var(--border)",
        borderRadius: 18,
        overflow: "hidden",
        animation: "aws-fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        boxShadow: isCapstoneDay ? "0 8px 36px var(--aws-orange-glow)" : "none",
      }}
    >
      {/* Hero */}
      <header style={{
        padding: "32px 36px 28px",
        background: isCapstoneDay
          ? "linear-gradient(135deg, var(--aws-orange-glow) 0%, transparent 70%)"
          : isReview
          ? "linear-gradient(135deg, var(--medium-bg) 0%, transparent 70%)"
          : "linear-gradient(135deg, var(--aws-orange-soft) 0%, transparent 70%)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24,
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: isReview ? "var(--medium)" : "var(--aws-orange)",
            marginBottom: 12,
          }}>
            {eyebrow}
          </p>
          <h2 style={{
            fontSize: 32, fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.025em", lineHeight: 1.1,
            marginBottom: phaseMeta ? 8 : 0,
            background: isCapstoneDay
              ? "linear-gradient(135deg, var(--aws-orange), #ffb84d)"
              : "none",
            WebkitBackgroundClip: isCapstoneDay ? "text" : undefined,
            WebkitTextFillColor: isCapstoneDay ? "transparent" : undefined,
            backgroundClip: isCapstoneDay ? "text" : undefined,
          }}>
            {heading}
          </h2>
          {phaseMeta && (
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
              {phaseMeta.title} — <em>{phaseMeta.tagline}</em>
            </p>
          )}
          {day.examWeight && (
            <p style={{
              marginTop: 10,
              fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
              color: "var(--aws-orange)",
              padding: "4px 10px",
              borderRadius: 999,
              background: "var(--aws-orange-soft)",
              border: "1px solid var(--aws-orange)",
              display: "inline-block",
            }}>
              SAA-C03 weight · {day.examWeight}
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
          >
            <span style={{ fontSize: 12 }}>{copied ? "✓" : "⎘"}</span>
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={onToggleTask}
            style={{
              padding: "11px 22px", borderRadius: 999, border: "none",
              background: taskDone
                ? "linear-gradient(135deg, var(--easy), #34d399)"
                : "linear-gradient(135deg, var(--aws-orange), var(--aws-orange-dim))",
              color: "#fff",
              fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
              cursor: "pointer", whiteSpace: "nowrap",
              boxShadow: taskDone
                ? "0 6px 20px rgba(48,209,88,0.35)"
                : "0 6px 20px var(--aws-orange-glow)",
              transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
              animation: taskDone ? "fde-celebrate 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" : undefined,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px) scale(1.03)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0) scale(1)"; }}
          >
            {taskDone ? "✓ Day complete" : isReview ? "Mark review done" : isCapstoneDay ? "Mark capstone shipped" : "Mark day complete"}
          </button>
        </div>
      </header>

      {/* Body */}
      <div style={{ padding: "26px 36px 32px", display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Today's task — always visible */}
        {day.task && (
          <div style={{
            padding: "16px 20px",
            borderRadius: 14,
            background: "linear-gradient(135deg, var(--aws-orange-soft) 0%, rgba(255,184,77,0.05) 100%)",
            border: "1px solid var(--aws-orange)",
            boxShadow: "0 0 0 4px var(--aws-orange-glow)",
          }}>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
              textTransform: "uppercase", color: "var(--aws-orange)",
              marginBottom: 8,
            }}>
              ✦ Today&apos;s lab
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--text-primary)" }}>
              {day.task}
            </p>
          </div>
        )}

        {/* Meta strip */}
        {(day.depth || day.source) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {day.depth && <MetaBlock label="Depth" body={day.depth} />}
            {day.source && <MetaBlock label="Source" body={day.source} mono />}
          </div>
        )}

        {/* Coursera-style section reader (only if day has sections) */}
        {day.sections && day.sections.length > 0 && (
          <LessonReader
            day={day}
            sectionIndex={progress?.sectionIndex ?? 0}
            onSectionChange={onSectionChange}
          />
        )}

        {/* Capstone — show stack + build phases */}
        {day.kind === "capstone" && cap && (
          <div style={{
            display: "flex", flexDirection: "column", gap: 14,
            padding: "16px 20px",
            borderRadius: 14,
            background: "var(--aws-orange-soft)",
            border: "1px solid var(--aws-orange)",
          }}>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-primary)" }}>
              {cap.summary}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {cap.stack.map((s) => (
                <span key={s} style={{
                  fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 999,
                  color: "#fff",
                  background: "linear-gradient(135deg, var(--aws-orange), var(--aws-orange-dim))",
                }}>{s}</span>
              ))}
            </div>
            <div>
              <p style={{ ...labelStyle, marginBottom: 8 }}>Build phases</p>
              <ul style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
                {cap.buildPhases.map((p, i) => (
                  <li key={i} style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--text-primary)" }}>
                    <strong style={{ color: "var(--aws-orange)" }}>{p.range}</strong> — {p.description}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p style={{ ...labelStyle, marginBottom: 8 }}>Engineering challenges</p>
              <ul style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                {cap.challenges.map((c, i) => (
                  <li key={i} style={{ fontSize: 13, lineHeight: 1.55, color: "var(--text-secondary)" }}>{c}</li>
                ))}
              </ul>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--easy)", fontStyle: "italic" }}>
              <strong>Outcome:</strong> {cap.outcome}
            </p>
          </div>
        )}

        {/* Review — checklist */}
        {isReview && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "Re-deploy any project from this phase from a clean slate in < 30 min.",
              "Take 15-20 SAA-C03 practice questions on this phase's domain.",
              "Review every wrong answer — note the rule that would have got it right.",
              "Read one AWS Well-Architected lens or whitepaper related to this phase.",
            ].map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 22, height: 22, borderRadius: 6,
                  background: "var(--aws-orange-soft)", color: "var(--aws-orange)",
                  fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1,
                }}>
                  {i + 1}
                </span>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-primary)" }}>{line}</p>
              </div>
            ))}
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
            onFocus={(e) => { e.target.style.borderBottomColor = "var(--aws-orange)"; }}
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

      {/* Phase progress footer */}
      <footer style={{
        padding: "14px 36px",
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--bg-surface)",
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-faint)", whiteSpace: "nowrap" }}>
          Phase {day.phase} progress
        </span>
        <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${day.phaseProgress}%`,
            background: "linear-gradient(90deg, var(--aws-orange), #ffb84d)",
            borderRadius: 99,
            transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
            boxShadow: "0 0 8px var(--aws-orange-glow)",
          }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--aws-orange)", fontVariantNumeric: "tabular-nums", minWidth: 32, textAlign: "right" }}>
          {day.phaseProgress}%
        </span>
      </footer>
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
