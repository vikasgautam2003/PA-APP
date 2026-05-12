"use client";

import { useMemo } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import ChapterCard from "@/components/gha/ChapterCard";
import ChapterSidebar from "@/components/gha/ChapterSidebar";
import {
  useGha,
  computeGhaOverallProgress,
  isGhaChapterComplete,
  findCurrentGhaChapter,
} from "@/hooks/useGha";
import { GHA_CHAPTERS, getGhaChapter } from "@/lib/gha-roadmap";

export default function GithubActionsPage() {
  const {
    selectedChapter,
    setSelectedChapter,
    progress,
    isLoading,
    toggleDone,
    setSectionIndex,
    saveNotes,
  } = useGha();

  const chapter = useMemo(() => getGhaChapter(selectedChapter), [selectedChapter]);
  const overall = useMemo(() => computeGhaOverallProgress(progress), [progress]);
  const currentChapter = useMemo(() => findCurrentGhaChapter(progress), [progress]);

  const idx = GHA_CHAPTERS.findIndex((c) => c.num === selectedChapter);
  const prev = idx > 0 ? GHA_CHAPTERS[idx - 1].num : null;
  const next = idx >= 0 && idx < GHA_CHAPTERS.length - 1 ? GHA_CHAPTERS[idx + 1].num : null;

  const isOnCurrent = selectedChapter === currentChapter;
  const chapterProgress = progress[selectedChapter];
  const chapterDone = !!chapter && isGhaChapterComplete(chapter.num, progress);

  return (
    <PageWrapper
      title="GitHub Actions"
      subtitle="Expert Pipeline Engineering · 8 chapters · 8 mini projects · 1 capstone"
      action={
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.18em",
              textTransform: "uppercase", color: "var(--gha-text-faint)",
            }}>
              CH {String(currentChapter).padStart(2, "0")} / {String(GHA_CHAPTERS.length).padStart(2, "0")} · GHA
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{
                fontSize: 26, fontWeight: 700, letterSpacing: "-0.025em",
                fontVariantNumeric: "tabular-nums", lineHeight: 1,
                background: "linear-gradient(135deg, var(--gha-blue), var(--gha-cyan))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                {overall.pct}
              </span>
              <span style={{ fontSize: 13, color: "var(--gha-text-muted)" }}>%</span>
            </div>
          </div>
          {!isOnCurrent && (
            <button
              onClick={() => setSelectedChapter(currentChapter)}
              style={{
                padding: "9px 18px", borderRadius: 999, border: "none",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
                cursor: "pointer",
                background: "linear-gradient(135deg, var(--gha-blue), var(--gha-blue-dim))",
                color: "#fff", textTransform: "uppercase",
                boxShadow: "0 4px 16px var(--gha-blue-glow)",
                transition: "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px) scale(1.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0) scale(1)"; }}
            >
              ★ Current
            </button>
          )}
        </div>
      }
    >
      {isLoading ? (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          height: 400, color: "var(--gha-text-faint)",
          fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
        }}>
          Loading
        </div>
      ) : !chapter ? (
        <p style={{ color: "var(--gha-text-muted)" }}>Chapter not found.</p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 36,
          alignItems: "start",
          maxWidth: 1280, margin: "0 auto",
        }}>
          <aside style={{ position: "sticky", top: 4 }}>
            <ChapterSidebar
              selectedChapter={selectedChapter}
              progress={progress}
              onSelect={setSelectedChapter}
            />
          </aside>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 4px",
            }}>
              <button
                onClick={() => prev && setSelectedChapter(prev)}
                disabled={!prev}
                style={{
                  padding: "6px 12px", borderRadius: 999,
                  border: "1px solid var(--gha-border)",
                  background: "transparent",
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
                  cursor: prev ? "pointer" : "not-allowed",
                  color: prev ? "var(--gha-text-muted)" : "var(--gha-text-faint)",
                  fontVariantNumeric: "tabular-nums",
                  transition: "all 0.2s",
                  opacity: prev ? 1 : 0.5,
                }}
              >
                ← CH {prev ? String(prev).padStart(2, "0") : "—"}
              </button>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
              }}>
                {selectedChapter === currentChapter ? (
                  <span style={{
                    color: "#fff", padding: "4px 12px", borderRadius: 999,
                    background: "linear-gradient(135deg, var(--gha-blue), var(--gha-cyan))",
                    boxShadow: "0 0 16px var(--gha-blue-glow)",
                    animation: "fde-pulse 2.4s ease-in-out infinite",
                  }}>● Current</span>
                ) : chapterDone ? (
                  <span style={{ color: "var(--gha-green)" }}>
                    ✓ Done{chapterProgress?.completedAt
                      ? ` · ${new Date(chapterProgress.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                      : ""}
                  </span>
                ) : (
                  <span style={{ color: "var(--gha-text-faint)" }}>○ Pending</span>
                )}
              </div>
              <button
                onClick={() => next && setSelectedChapter(next)}
                disabled={!next}
                style={{
                  padding: "6px 12px", borderRadius: 999,
                  border: "1px solid var(--gha-border)",
                  background: "transparent",
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
                  cursor: next ? "pointer" : "not-allowed",
                  color: next ? "var(--gha-text-muted)" : "var(--gha-text-faint)",
                  fontVariantNumeric: "tabular-nums",
                  transition: "all 0.2s",
                  opacity: next ? 1 : 0.5,
                }}
              >
                CH {next ? String(next).padStart(2, "0") : "—"} →
              </button>
            </div>

            <ChapterCard
              chapter={chapter}
              progress={chapterProgress}
              onToggleDone={() => void toggleDone(chapter.num)}
              onSectionChange={(i) => void setSectionIndex(chapter.num, i)}
              onSaveNotes={(notes) => void saveNotes(chapter.num, notes)}
            />
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
