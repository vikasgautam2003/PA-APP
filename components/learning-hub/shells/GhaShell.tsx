"use client";

import { useMemo } from "react";
import ChapterCard from "@/components/gha/ChapterCard";
import ChapterSidebar from "@/components/gha/ChapterSidebar";
import { useGha, isGhaChapterComplete, findCurrentGhaChapter } from "@/hooks/useGha";
import { GHA_CHAPTERS, getGhaChapter } from "@/lib/gha-roadmap";

export default function GhaShell() {
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
  const currentChapter = useMemo(() => findCurrentGhaChapter(progress), [progress]);

  const idx = GHA_CHAPTERS.findIndex((c) => c.num === selectedChapter);
  const prev = idx > 0 ? GHA_CHAPTERS[idx - 1].num : null;
  const next = idx >= 0 && idx < GHA_CHAPTERS.length - 1 ? GHA_CHAPTERS[idx + 1].num : null;

  const chapterProgress = progress[selectedChapter];
  const chapterDone = !!chapter && isGhaChapterComplete(chapter.num, progress);

  if (isLoading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: 400, color: "var(--text-faint)",
        fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
      }}>
        Loading
      </div>
    );
  }

  if (!chapter) return <p style={{ color: "var(--text-muted)" }}>Chapter not found.</p>;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "260px 1fr",
      gap: 40,
      alignItems: "start",
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
          <button onClick={() => prev && setSelectedChapter(prev)} disabled={!prev} style={navBtn(!!prev)}>
            ← Ch {prev ? String(prev).padStart(2, "0") : "—"}
          </button>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
          }}>
            {selectedChapter === currentChapter ? (
              <span style={{
                color: "#fff", padding: "4px 12px", borderRadius: 999,
                background: "linear-gradient(135deg, var(--accent), #7c3aed)",
                boxShadow: "0 0 16px var(--accent-glow)",
              }}>● Current</span>
            ) : chapterDone ? (
              <span style={{ color: "var(--easy)" }}>
                ✓ Done{chapterProgress?.completedAt ? ` · ${new Date(chapterProgress.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}
              </span>
            ) : (
              <span style={{ color: "var(--text-faint)" }}>○ Pending</span>
            )}
          </div>
          <button onClick={() => next && setSelectedChapter(next)} disabled={!next} style={navBtn(!!next)}>
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
  );
}

function navBtn(enabled: boolean): React.CSSProperties {
  return {
    padding: "6px 12px", borderRadius: 999,
    border: "1px solid var(--border)",
    background: "transparent",
    fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
    cursor: enabled ? "pointer" : "not-allowed",
    color: enabled ? "var(--text-secondary)" : "var(--text-faint)",
    fontVariantNumeric: "tabular-nums",
    transition: "all 0.2s",
    opacity: enabled ? 1 : 0.5,
  };
}
