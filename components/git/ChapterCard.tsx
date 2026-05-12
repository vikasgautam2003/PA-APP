"use client";

import { useState, useEffect } from "react";
import type { GitChapter, GitChapterProgress } from "@/types";
import LessonReader from "./LessonReader";

interface Props {
  chapter: GitChapter;
  progress: GitChapterProgress | undefined;
  onToggleDone: () => void;
  onSectionChange: (idx: number) => void;
  onSaveNotes: (notes: string) => void;
}

export default function ChapterCard({
  chapter,
  progress,
  onToggleDone,
  onSectionChange,
  onSaveNotes,
}: Props) {
  const [notes, setNotes] = useState(progress?.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    setNotes(progress?.notes ?? "");
  }, [chapter.num, progress?.notes]);

  const done = !!progress?.done;
  const accent = chapter.accentColor;
  const accentSoft = `${accent}1a`;
  const accentBorder = `${accent}55`;
  const isCheatSheet = chapter.kind === "cheatsheet";

  return (
    <article
      style={{
        background: "var(--gha-bg-elevated)",
        border: `1px solid ${accentBorder}`,
        borderRadius: 18,
        overflow: "hidden",
        animation: "gha-fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        boxShadow: `0 8px 32px ${accent}22`,
      }}
    >
      <header style={{
        padding: "30px 36px 26px",
        background: `linear-gradient(135deg, ${accentSoft} 0%, transparent 75%)`,
        borderBottom: "1px solid var(--gha-border-mute)",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24,
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: accent,
            marginBottom: 12,
          }}>
            {isCheatSheet ? "★ Survival Cheat Sheet" : `Chapter ${chapter.num}`}
          </p>
          <h2 style={{
            fontSize: 30, fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.025em", lineHeight: 1.15,
            marginBottom: 10,
          }}>
            {chapter.title}
          </h2>
          <p style={{ fontSize: 14, color: "var(--gha-text-muted)", lineHeight: 1.55 }}>
            {chapter.subtitle}
          </p>
        </div>
        <button
          onClick={onToggleDone}
          style={{
            padding: "11px 22px", borderRadius: 999, border: "none",
            background: done
              ? "linear-gradient(135deg, var(--gha-green), #56d364)"
              : `linear-gradient(135deg, ${accent}, var(--gha-cyan))`,
            color: done ? "#fff" : "#0d1117",
            fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
            cursor: "pointer", whiteSpace: "nowrap",
            boxShadow: done
              ? "0 6px 20px rgba(63,185,80,0.35)"
              : `0 6px 20px ${accent}55`,
            transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
            animation: done ? "fde-celebrate 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" : undefined,
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px) scale(1.03)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0) scale(1)"; }}
        >
          {done ? "✓ Chapter done" : isCheatSheet ? "Mark cheat sheet read" : "Mark chapter done"}
        </button>
      </header>

      <div style={{ padding: "24px 36px 30px", display: "flex", flexDirection: "column", gap: 18 }}>
        {chapter.why && !isCheatSheet && (
          <div style={{
            padding: "14px 18px",
            borderRadius: 12,
            background: accentSoft,
            border: `1px solid ${accentBorder}`,
          }}>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: accent,
              marginBottom: 6,
            }}>
              ✦ Why
            </p>
            <p style={{ fontSize: 14.5, lineHeight: 1.65, color: "var(--text-primary)" }}>
              {chapter.why}
            </p>
          </div>
        )}

        <LessonReader
          chapter={chapter}
          sectionIndex={progress?.sectionIndex ?? 0}
          onSectionChange={onSectionChange}
        />

        <div style={{
          padding: "14px 18px", borderRadius: 12,
          background: "var(--gha-bg-surface)",
          border: "1px solid var(--gha-border)",
        }}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--gha-text-muted)",
            marginBottom: 8,
          }}>Notes</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Team conventions to remember, gotchas you hit, shortcuts that worked…"
            rows={3}
            style={{
              width: "100%", padding: "8px 0",
              border: "none", borderBottom: "1px solid var(--gha-border)",
              fontSize: 13.5, color: "var(--text-primary)",
              background: "transparent",
              outline: "none", resize: "vertical", lineHeight: 1.6,
              fontFamily: "inherit",
              transition: "border-color 0.18s",
            }}
            onFocus={(e) => { e.target.style.borderBottomColor = accent; }}
            onBlur={(e) => { e.target.style.borderBottomColor = "var(--gha-border)"; }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button
              onClick={async () => { setSavingNotes(true); await onSaveNotes(notes); setSavingNotes(false); }}
              disabled={savingNotes}
              style={{
                padding: "6px 14px", borderRadius: 999,
                border: "1px solid var(--gha-border)",
                background: "transparent",
                fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
                color: savingNotes ? "var(--gha-text-faint)" : "var(--gha-text-muted)",
                textTransform: "uppercase", cursor: savingNotes ? "not-allowed" : "pointer",
                transition: "all 0.18s",
              }}
            >
              {savingNotes ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
