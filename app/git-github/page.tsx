"use client";

import { useMemo } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import ChapterCard from "@/components/git/ChapterCard";
import ChapterSidebar from "@/components/git/ChapterSidebar";
import {
  useGit,
  computeGitOverallProgress,
  isGitChapterComplete,
  findCurrentGitChapter,
} from "@/hooks/useGit";
import { GIT_CHAPTERS, getGitChapter } from "@/lib/git-roadmap";

export default function GitGithubPage() {
  const {
    selectedChapter,
    setSelectedChapter,
    progress,
    isLoading,
    toggleDone,
    setSectionIndex,
    saveNotes,
  } = useGit();

  const chapter = useMemo(() => getGitChapter(selectedChapter), [selectedChapter]);
  const overall = useMemo(() => computeGitOverallProgress(progress), [progress]);
  const currentChapter = useMemo(() => findCurrentGitChapter(progress), [progress]);

  const idx = GIT_CHAPTERS.findIndex((c) => c.num === selectedChapter);
  const prev = idx > 0 ? GIT_CHAPTERS[idx - 1].num : null;
  const next = idx >= 0 && idx < GIT_CHAPTERS.length - 1 ? GIT_CHAPTERS[idx + 1].num : null;

  const isOnCurrent = selectedChapter === currentChapter;
  const chapterProgress = progress[selectedChapter];
  const chapterDone = !!chapter && isGitChapterComplete(chapter.num, progress);

  return (
    <PageWrapper
      title="Git & GitHub"
      subtitle="9 chapters · Company-ready collaboration · Commands · Traps that cost jobs"
      action={
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.18em",
              textTransform: "uppercase", color: "var(--text-faint)",
            }}>
              Chapter {String(currentChapter).padStart(2, "0")} / {GIT_CHAPTERS.length}
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
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>%</span>
            </div>
          </div>
          {!isOnCurrent && (
            <button
              onClick={() => setSelectedChapter(currentChapter)}
              style={{
                padding: "9px 18px", borderRadius: 999, border: "none",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
                cursor: "pointer",
                background: "linear-gradient(135deg, var(--gha-blue), var(--gha-cyan))",
                color: "#0d1117", textTransform: "uppercase",
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
          height: 400, color: "var(--text-faint)",
          fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
        }}>
          Loading
        </div>
      ) : !chapter ? (
        <p style={{ color: "var(--text-muted)" }}>Chapter not found.</p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: 40,
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
                  color: prev ? "var(--gha-text)" : "var(--gha-text-faint)",
                  fontVariantNumeric: "tabular-nums",
                  transition: "all 0.2s",
                  opacity: prev ? 1 : 0.5,
                }}
              >
                ← Ch {prev ? String(prev).padStart(2, "0") : "—"}
              </button>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
              }}>
                {selectedChapter === currentChapter ? (
                  <span style={{
                    color: "#0d1117", padding: "4px 12px", borderRadius: 999,
                    background: "linear-gradient(135deg, var(--gha-blue), var(--gha-cyan))",
                    boxShadow: "0 0 16px var(--gha-blue-glow)",
                  }}>● Current</span>
                ) : chapterDone ? (
                  <span style={{ color: "var(--gha-green)" }}>
                    ✓ Done{chapterProgress?.completedAt ? ` · ${new Date(chapterProgress.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}
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
                  color: next ? "var(--gha-text)" : "var(--gha-text-faint)",
                  fontVariantNumeric: "tabular-nums",
                  transition: "all 0.2s",
                  opacity: next ? 1 : 0.5,
                }}
              >
                Ch {next ? String(next).padStart(2, "0") : "—"} →
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
