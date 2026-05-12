"use client";

import { useState, useEffect } from "react";
import type { GhaChapter, GhaChapterProgress } from "@/types";
import LessonReader from "./LessonReader";

interface Props {
  chapter: GhaChapter;
  progress: GhaChapterProgress | undefined;
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

  const isCapstone = chapter.kind === "capstone";
  const done = !!progress?.done;

  return (
    <article
      style={{
        background: "var(--gha-bg-elevated)",
        border: "1px solid",
        borderColor: isCapstone ? "var(--gha-purple)" : "var(--gha-border)",
        borderRadius: 16,
        overflow: "hidden",
        animation: "gha-fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        boxShadow: isCapstone ? "0 8px 36px var(--gha-purple-glow)" : "none",
      }}
    >
      {/* Hero */}
      <header style={{
        padding: "30px 32px 26px",
        background: isCapstone
          ? "linear-gradient(135deg, var(--gha-purple-glow) 0%, transparent 75%)"
          : "linear-gradient(135deg, var(--gha-blue-soft) 0%, transparent 70%)",
        borderBottom: "1px solid var(--gha-border-mute)",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 22,
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: isCapstone ? "var(--gha-purple)" : "var(--gha-blue)",
            marginBottom: 10,
          }}>
            {isCapstone ? "★ CAPSTONE" : `CHAPTER ${String(chapter.num).padStart(2, "0")}`}
          </p>
          <h2 style={{
            fontSize: 28, fontWeight: 700,
            color: "var(--gha-text)",
            letterSpacing: "-0.022em", lineHeight: 1.15,
            marginBottom: 8,
            background: isCapstone
              ? "linear-gradient(135deg, var(--gha-purple), #c694ff)"
              : "none",
            WebkitBackgroundClip: isCapstone ? "text" : undefined,
            WebkitTextFillColor: isCapstone ? "transparent" : undefined,
            backgroundClip: isCapstone ? "text" : undefined,
          }}>
            {chapter.title.replace(/^Capstone — /, "").replace(/^Chapter \d+ — /, "")}
          </h2>
          {chapter.subtitle && (
            <p style={{
              fontSize: 13.5, color: "var(--gha-text-muted)", lineHeight: 1.55,
            }}>
              {chapter.subtitle}
            </p>
          )}
          {chapter.miniProjectTitle && (
            <p style={{
              marginTop: 12,
              fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
              color: "var(--gha-green)",
              padding: "4px 10px",
              borderRadius: 999,
              background: "rgba(63, 185, 80, 0.10)",
              border: "1px solid var(--gha-green)",
              display: "inline-block",
            }}>
              ▸ {chapter.miniProjectTitle}
            </p>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <button
            onClick={onToggleDone}
            style={{
              padding: "11px 22px", borderRadius: 999, border: "none",
              background: done
                ? "linear-gradient(135deg, var(--gha-green), #4ade80)"
                : isCapstone
                ? "linear-gradient(135deg, var(--gha-purple), #c694ff)"
                : "linear-gradient(135deg, var(--gha-blue), var(--gha-blue-dim))",
              color: "#fff",
              fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
              cursor: "pointer", whiteSpace: "nowrap",
              boxShadow: done
                ? "0 6px 20px var(--gha-green-glow)"
                : isCapstone
                ? "0 6px 20px var(--gha-purple-glow)"
                : "0 6px 20px var(--gha-blue-glow)",
              transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px) scale(1.03)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0) scale(1)"; }}
          >
            {done ? "✓ Completed" : isCapstone ? "Mark capstone shipped" : "Mark chapter done"}
          </button>
        </div>
      </header>

      {/* Body */}
      <div style={{ padding: "24px 32px 30px", display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Mini-project description */}
        {chapter.miniProjectDesc && (
          <div style={{
            padding: "14px 18px",
            borderRadius: 12,
            background: "rgba(63, 185, 80, 0.06)",
            border: "1px solid var(--gha-green)",
            boxShadow: "0 0 0 3px var(--gha-green-glow)",
          }}>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
              textTransform: "uppercase", color: "var(--gha-green)",
              marginBottom: 6,
            }}>
              ▸ Mini-project
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--gha-text)" }}>
              {chapter.miniProjectDesc}
            </p>
          </div>
        )}

        {/* Section reader */}
        <LessonReader
          chapter={chapter}
          sectionIndex={progress?.sectionIndex ?? 0}
          onSectionChange={onSectionChange}
        />

        {/* Capstone deliverables */}
        {isCapstone && chapter.deliverables && chapter.deliverables.length > 0 && (
          <div style={{
            display: "flex", flexDirection: "column", gap: 12,
            padding: "20px 22px",
            borderRadius: 14,
            background: "var(--gha-purple-glow)",
            border: "1px solid var(--gha-purple)",
          }}>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
              textTransform: "uppercase", color: "var(--gha-purple)",
              marginBottom: 4,
            }}>
              ★ Deliverables
            </p>
            {chapter.deliverables.map((d, i) => (
              <div key={i} style={{
                padding: "14px 16px",
                borderRadius: 10,
                background: "var(--gha-bg-elevated)",
                border: "1px solid var(--gha-border)",
              }}>
                <p style={{
                  fontSize: 13, fontWeight: 700,
                  color: "var(--gha-purple)",
                  marginBottom: 5,
                }}>
                  {d.title}
                </p>
                <p style={{
                  fontSize: 12.5, lineHeight: 1.6,
                  color: "var(--gha-text-muted)",
                }}>
                  {d.body}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        <div style={{
          padding: "14px 18px", borderRadius: 12,
          background: "var(--gha-bg-surface)",
          border: "1px solid var(--gha-border)",
        }}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
            textTransform: "uppercase", color: "var(--gha-text-faint)",
            marginBottom: 8,
          }}>
            Notes
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What did you build? What broke? What worked?"
            rows={3}
            style={{
              width: "100%", padding: "8px 0",
              border: "none", borderBottom: "1px solid var(--gha-border)",
              fontSize: 13.5, color: "var(--gha-text)",
              background: "transparent",
              outline: "none", resize: "vertical", lineHeight: 1.6,
              fontFamily: "inherit",
              transition: "border-color 0.18s",
            }}
            onFocus={(e) => { e.target.style.borderBottomColor = "var(--gha-blue)"; }}
            onBlur={(e) => { e.target.style.borderBottomColor = "var(--gha-border)"; }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button
              onClick={async () => {
                setSavingNotes(true);
                await onSaveNotes(notes);
                setSavingNotes(false);
              }}
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
