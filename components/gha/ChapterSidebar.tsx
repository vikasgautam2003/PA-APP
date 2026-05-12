"use client";

import { GHA_CHAPTERS } from "@/lib/gha-roadmap";
import { isGhaChapterComplete } from "@/hooks/useGha";
import type { GhaChapterProgress } from "@/types";

interface Props {
  selectedChapter: number;
  progress: Record<number, GhaChapterProgress>;
  onSelect: (n: number) => void;
}

export default function ChapterSidebar({ selectedChapter, progress, onSelect }: Props) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 6,
      padding: 10,
      borderRadius: 14,
      border: "1px solid var(--gha-border)",
      background: "var(--gha-bg-elevated)",
    }}>
      <p style={{
        fontSize: 9, fontWeight: 700, letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: "var(--gha-text-faint)",
        padding: "6px 10px 8px",
        borderBottom: "1px solid var(--gha-border-mute)",
        marginBottom: 4,
      }}>
        CHAPTERS · 8 + 1 capstone
      </p>
      {GHA_CHAPTERS.map((c) => {
        const done = isGhaChapterComplete(c.num, progress);
        const isSelected = c.num === selectedChapter;
        const isCapstone = c.kind === "capstone";

        return (
          <button
            key={c.num}
            onClick={() => onSelect(c.num)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px",
              borderRadius: 10,
              border: isSelected
                ? "1px solid var(--gha-blue)"
                : "1px solid transparent",
              background: isSelected
                ? "var(--gha-blue-soft)"
                : "transparent",
              boxShadow: isSelected
                ? "0 0 0 3px var(--gha-blue-glow)"
                : "none",
              cursor: "pointer", textAlign: "left",
              transition: "all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.background = "var(--gha-bg-surface)";
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.background = "transparent";
            }}
          >
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 28, height: 28,
              borderRadius: 8,
              flexShrink: 0,
              fontSize: 11, fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              background: done
                ? "var(--gha-green)"
                : isSelected
                ? "var(--gha-blue)"
                : isCapstone
                ? "var(--gha-purple)"
                : "var(--gha-bg-surface)",
              color: done || isSelected || isCapstone
                ? "#fff"
                : "var(--gha-text-muted)",
              border: done || isSelected || isCapstone
                ? "1px solid transparent"
                : "1px solid var(--gha-border)",
              transition: "all 0.18s",
            }}>
              {done ? "✓" : isCapstone ? "★" : String(c.num).padStart(2, "0")}
            </span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: isCapstone
                  ? "var(--gha-purple)"
                  : isSelected
                  ? "var(--gha-blue)"
                  : "var(--gha-text-faint)",
                marginBottom: 2,
              }}>
                {isCapstone ? "CAPSTONE" : `CH ${String(c.num).padStart(2, "0")}`}
              </p>
              <p style={{
                fontSize: 12.5, fontWeight: 600,
                color: "var(--gha-text)",
                lineHeight: 1.35,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
                {c.title.replace(/^Capstone — /, "").replace(/ — .*$/, "")}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
