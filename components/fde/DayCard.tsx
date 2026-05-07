"use client";

import { useState, useEffect } from "react";
import type { FdeDay, FdeDayProgress } from "@/types";
import { getCapstone, getMonthMeta } from "@/lib/fde-roadmap";

const DIFF_COLOR: Record<string, string> = {
  Easy: "var(--easy)",
  Medium: "var(--medium)",
  Hard: "var(--hard)",
};
const DIFF_BG: Record<string, string> = {
  Easy: "var(--easy-bg)",
  Medium: "var(--medium-bg)",
  Hard: "var(--hard-bg)",
};

function tierStyle(tier?: string): { color: string; bg: string } {
  if (!tier) return { color: "var(--text-muted)", bg: "var(--bg-elevated)" };
  if (tier.startsWith("Easy")) return { color: DIFF_COLOR.Easy, bg: DIFF_BG.Easy };
  if (tier.startsWith("Medium")) return { color: DIFF_COLOR.Medium, bg: DIFF_BG.Medium };
  if (tier.startsWith("Hard")) return { color: DIFF_COLOR.Hard, bg: DIFF_BG.Hard };
  return { color: "var(--text-muted)", bg: "var(--bg-elevated)" };
}

interface SectionProps {
  label: string;
  accent: string;
  body: string;
}

function Section({ label, accent, body }: SectionProps) {
  return (
    <div style={{
      borderTop: `2px solid ${accent}`,
      paddingTop: 14, paddingBottom: 4,
    }}>
      <p style={{
        fontSize: 10, fontWeight: 700,
        letterSpacing: "0.08em", textTransform: "uppercase",
        color: accent, marginBottom: 6,
      }}>{label}</p>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-primary)" }}>
        {body}
      </p>
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

  useEffect(() => {
    setNotes(progress?.notes ?? "");
  }, [day.day, progress?.notes]);

  const monthMeta = getMonthMeta(day.month);
  const dsaStyle = tierStyle(day.dsa?.tier ?? day.dsaTier);

  // Rest day card
  if (day.kind === "rest") {
    return (
      <div style={{
        border: "1px solid var(--border)", borderRadius: 18,
        background: "var(--bg-elevated)", overflow: "hidden",
        boxShadow: "var(--shadow-card)",
      }}>
        <div style={{
          padding: "20px 28px",
          borderBottom: "1px solid var(--border)",
          background: "linear-gradient(135deg, var(--medium-bg), transparent)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--medium)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
              Day {day.day} · Month {day.month} · Week {day.weekInMonth}
            </p>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Rest Day 🌿
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
              No DSA. No task. Deliberate recovery is part of the system.
            </p>
          </div>
          <button onClick={onToggleTask} style={{
            padding: "10px 22px", borderRadius: 10, border: "none",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            background: progress?.taskDone ? "var(--easy)" : "var(--accent)",
            color: "#fff",
            boxShadow: progress?.taskDone ? "0 0 14px var(--easy)" : "0 0 14px var(--accent-glow)",
          }}>
            {progress?.taskDone ? "✓ Logged" : "Mark rest taken"}
          </button>
        </div>
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            "Review your week: what clicked, what didn't, what you'd do differently",
            "Read 1 chapter of a book (Fluent Python / DDIA / System Design Interview)",
            "Take a walk — your brain consolidates learning during rest",
            "Optional: write a brief note about what you learned this week",
          ].map((line, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ color: "var(--accent)", fontSize: 14, marginTop: 2 }}>■</span>
              <span style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6 }}>{line}</span>
            </div>
          ))}
          <NotesEditor
            value={notes}
            onChange={setNotes}
            onSave={async () => { setSavingNotes(true); await onSaveNotes(notes); setSavingNotes(false); }}
            saving={savingNotes}
          />
        </div>
      </div>
    );
  }

  // Capstone day card
  if (day.kind === "capstone") {
    const cap = getCapstone(day.month);
    return (
      <div style={{
        border: "1px solid var(--accent)", borderRadius: 18,
        background: "var(--bg-elevated)", overflow: "hidden",
        boxShadow: "0 0 24px var(--accent-glow)",
      }}>
        <div style={{
          padding: "20px 28px",
          borderBottom: "1px solid var(--border)",
          background: "linear-gradient(135deg, var(--accent-glow), transparent)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
              ◆ Capstone Day · Day {day.day}
            </p>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              {cap?.name ?? "Capstone"}
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{cap?.tagline}</p>
          </div>
          <button onClick={onToggleTask} style={{
            padding: "10px 22px", borderRadius: 10, border: "none",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            background: progress?.taskDone ? "var(--easy)" : "var(--accent)",
            color: "#fff",
            boxShadow: progress?.taskDone ? "0 0 14px var(--easy)" : "0 0 14px var(--accent-glow)",
          }}>
            {progress?.taskDone ? "✓ Capstone shipped" : "Mark capstone done"}
          </button>
        </div>
        <div style={{ padding: "20px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
          <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6 }}>{cap?.summary}</p>

          {cap && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
                Stack
              </p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {cap.stack.map((s) => (
                  <span key={s} style={{
                    fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 99,
                    color: "var(--accent-text)", background: "var(--accent-glow)",
                    border: "1px solid var(--accent-glow)",
                  }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {cap && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
                Build phases
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {cap.buildPhases.map((p, i) => (
                  <div key={i} style={{
                    border: "1px solid var(--border)", borderRadius: 12,
                    padding: "12px 14px", background: "var(--bg-surface)",
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>{p.range}</p>
                    <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.6 }}>{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cap && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--hard)", marginBottom: 8 }}>
                Engineering challenges (you WILL hit these)
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {cap.challenges.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: "var(--hard)", fontSize: 12, marginTop: 3 }}>■</span>
                    <span style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.6 }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cap && (
            <div style={{
              border: "1px solid var(--easy)", borderRadius: 12,
              padding: "12px 16px", background: "var(--easy-bg)",
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--easy)", marginBottom: 4 }}>
                Outcome
              </p>
              <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.6 }}>{cap.outcome}</p>
            </div>
          )}

          {day.dsa && (
            <DsaSection day={day} progress={progress} onToggleDsa={onToggleDsa} dsaStyle={dsaStyle} />
          )}

          <NotesEditor
            value={notes}
            onChange={setNotes}
            onSave={async () => { setSavingNotes(true); await onSaveNotes(notes); setSavingNotes(false); }}
            saving={savingNotes}
          />
        </div>
      </div>
    );
  }

  // Lesson day card
  return (
    <div style={{
      border: "1px solid var(--border)", borderRadius: 18,
      background: "var(--bg-elevated)", overflow: "hidden",
      boxShadow: "var(--shadow-card)",
    }}>
      <div style={{
        padding: "20px 28px",
        borderBottom: "1px solid var(--border)",
        background: "linear-gradient(135deg, var(--accent-glow), transparent)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
            Day {day.day} · Month {day.month} · Week {day.weekInMonth}
          </p>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            {day.topic}
          </h2>
          {monthMeta && (
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
              {monthMeta.title}
            </p>
          )}
        </div>
        <button onClick={onToggleTask} style={{
          padding: "10px 22px", borderRadius: 10, border: "none",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
          background: progress?.taskDone ? "var(--easy)" : "var(--accent)",
          color: "#fff", whiteSpace: "nowrap",
          boxShadow: progress?.taskDone ? "0 0 14px var(--easy)" : "0 0 14px var(--accent-glow)",
          transition: "all 0.15s",
        }}>
          {progress?.taskDone ? "✓ Task done" : "Mark task done"}
        </button>
      </div>

      <div style={{ padding: "20px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Today's task */}
        <div style={{
          padding: "14px 16px", borderRadius: 12,
          background: "var(--bg-surface)", border: "1px solid var(--accent)",
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 6 }}>
            Today&apos;s task
          </p>
          <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6 }}>
            {day.task}
          </p>
        </div>

        {/* Depth + source meta row */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {day.depth && (
            <div style={{ flex: 1, minWidth: 220 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>
                Depth
              </p>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "monospace" }}>{day.depth}</p>
            </div>
          )}
          {day.source && (
            <div style={{ flex: 1, minWidth: 220 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>
                Source
              </p>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "monospace", wordBreak: "break-word" }}>{day.source}</p>
            </div>
          )}
        </div>

        {day.whyMatters && <Section label="Why this matters" accent="#3b82f6" body={day.whyMatters} />}
        {day.howToDoIt && <Section label="How to do it" accent="var(--easy)" body={day.howToDoIt} />}
        {day.watchOutFor && <Section label="⚠ Watch out for" accent="var(--medium)" body={day.watchOutFor} />}
        {day.doneWhen && <Section label="✓ You are done when" accent="#7c3aed" body={day.doneWhen} />}

        {day.dsa && (
          <DsaSection day={day} progress={progress} onToggleDsa={onToggleDsa} dsaStyle={dsaStyle} />
        )}

        <NotesEditor
          value={notes}
          onChange={setNotes}
          onSave={async () => { setSavingNotes(true); await onSaveNotes(notes); setSavingNotes(false); }}
          saving={savingNotes}
        />

        {/* Capstone progress */}
        <div style={{
          marginTop: 4, paddingTop: 14, borderTop: "1px solid var(--border)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Month {day.month} capstone progress
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-text)", fontVariantNumeric: "tabular-nums" }}>
              {day.capstoneProgress}%
            </span>
          </div>
          <div style={{ height: 5, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${day.capstoneProgress}%`,
              background: "linear-gradient(90deg, var(--accent), var(--easy))",
              borderRadius: 99, transition: "width 0.5s ease",
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DsaSection({
  day, progress, onToggleDsa, dsaStyle,
}: {
  day: FdeDay;
  progress: FdeDayProgress | undefined;
  onToggleDsa: () => void;
  dsaStyle: { color: string; bg: string };
}) {
  if (!day.dsa) return null;
  return (
    <div style={{
      border: `1px solid ${dsaStyle.color}`, borderRadius: 12,
      padding: "14px 16px", background: dsaStyle.bg,
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99, color: dsaStyle.color, background: "var(--bg-surface)", border: `1px solid ${dsaStyle.color}` }}>
            DSA · {day.dsa.tier}
          </span>
        </div>
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>
          {day.dsa.title}
        </p>
        <p style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>
          Approach: {day.dsa.approach}
        </p>
      </div>
      <button onClick={onToggleDsa} style={{
        padding: "9px 18px", borderRadius: 10, border: "none",
        fontSize: 12, fontWeight: 600, cursor: "pointer",
        background: progress?.dsaDone ? "var(--easy)" : dsaStyle.color,
        color: "#fff", whiteSpace: "nowrap",
      }}>
        {progress?.dsaDone ? "✓ DSA solved" : "Mark DSA done"}
      </button>
    </div>
  );
}

function NotesEditor({
  value, onChange, onSave, saving,
}: {
  value: string;
  onChange: (v: string) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}) {
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>
        Your notes
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="What clicked? What broke? What did you ship?"
        rows={4}
        style={{
          width: "100%", padding: "10px 14px", borderRadius: 10,
          border: "1px solid var(--border)", fontSize: 13,
          color: "var(--text-primary)", background: "var(--bg-surface)",
          outline: "none", resize: "vertical", lineHeight: 1.6,
          fontFamily: "inherit",
        }}
        onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
        onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
        <button onClick={onSave} disabled={saving} style={{
          padding: "7px 16px", borderRadius: 8, border: "1px solid var(--border)",
          fontSize: 12, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer",
          background: saving ? "var(--bg-elevated)" : "var(--bg-surface)",
          color: "var(--text-secondary)",
        }}>
          {saving ? "Saving…" : "Save notes"}
        </button>
      </div>
    </div>
  );
}
