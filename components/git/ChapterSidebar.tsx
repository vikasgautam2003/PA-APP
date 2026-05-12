"use client";

import { GIT_CHAPTERS } from "@/lib/git-roadmap";
import { isGitChapterComplete } from "@/hooks/useGit";
import type { GitChapterProgress } from "@/types";

interface Props {
  selectedChapter: number;
  progress: Record<number, GitChapterProgress>;
  onSelect: (n: number) => void;
}

export default function ChapterSidebar({ selectedChapter, progress, onSelect }: Props) {
  const totalDone = GIT_CHAPTERS.filter((c) => isGitChapterComplete(c.num, progress)).length;
  const total = GIT_CHAPTERS.length;
  const pct = Math.round((totalDone / total) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{
        padding: "16px 18px",
        borderRadius: 14,
        border: "1px solid var(--gha-border)",
        background: "linear-gradient(180deg, rgba(88,166,255,0.10) 0%, var(--gha-bg-elevated) 80%)",
      }}>
        <p style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.18em",
          color: "var(--gha-blue)", textTransform: "uppercase",
          marginBottom: 8,
        }}>
          Git & GitHub · Company-Ready
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
          <span style={{
            fontSize: 22, fontWeight: 700, letterSpacing: "-0.025em",
            fontVariantNumeric: "tabular-nums", lineHeight: 1,
            background: "linear-gradient(135deg, var(--gha-blue), var(--gha-cyan))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            {totalDone}
          </span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            / {total} chapters · {pct}%
          </span>
        </div>
        <div style={{
          height: 3, background: "var(--gha-border)",
          borderRadius: 99, overflow: "hidden",
        }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            background: "linear-gradient(90deg, var(--gha-blue), var(--gha-cyan))",
            borderRadius: 99,
            transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
            boxShadow: pct > 0 ? "0 0 10px var(--gha-blue-glow)" : "none",
          }} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {GIT_CHAPTERS.map((c, i) => {
          const done = isGitChapterComplete(c.num, progress);
          const isSelected = c.num === selectedChapter;
          const isCheatSheet = c.kind === "cheatsheet";

          return (
            <button
              key={c.num}
              onClick={() => onSelect(c.num)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid",
                borderColor: isSelected ? c.accentColor : "var(--gha-border)",
                background: isSelected
                  ? `linear-gradient(135deg, ${c.accentColor}26 0%, var(--gha-bg-elevated) 70%)`
                  : "var(--gha-bg-elevated)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
                boxShadow: isSelected ? `0 4px 14px ${c.accentColor}33` : "none",
                animation: `gha-fade-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) ${i * 35}ms backwards`,
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = c.accentColor;
                  e.currentTarget.style.transform = "translateX(2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "var(--gha-border)";
                  e.currentTarget.style.transform = "translateX(0)";
                }
              }}
            >
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28, borderRadius: 8,
                background: done
                  ? "linear-gradient(135deg, var(--gha-green), #56d364)"
                  : isSelected
                    ? c.accentColor
                    : "var(--gha-bg-surface)",
                border: `1px solid ${done ? "transparent" : isSelected ? c.accentColor : "var(--gha-border)"}`,
                color: done || isSelected ? "#fff" : c.accentColor,
                fontSize: 11, fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                flexShrink: 0,
                boxShadow: done
                  ? "0 2px 8px rgba(63,185,80,0.35)"
                  : isSelected
                    ? `0 2px 8px ${c.accentColor}55`
                    : "none",
              }}>
                {done ? "✓" : isCheatSheet ? "★" : String(c.num).padStart(2, "0")}
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.16em",
                  color: isSelected ? c.accentColor : "var(--text-faint)",
                  textTransform: "uppercase",
                  marginBottom: 3,
                }}>
                  {isCheatSheet ? "Cheat Sheet" : `Chapter ${c.num}`}
                </p>
                <p style={{
                  fontSize: 12.5, fontWeight: 600,
                  color: "var(--text-primary)",
                  lineHeight: 1.35,
                  display: "-webkit-box",
                  WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                  {c.title.split(" — ")[0]}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
