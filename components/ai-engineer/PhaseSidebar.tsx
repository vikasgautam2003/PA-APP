"use client";

import { AIE_PHASES } from "@/lib/aie-roadmap";
import { isAiePhaseComplete } from "@/hooks/useAie";
import type { AiePhaseProgress } from "@/types";

interface Props {
  selectedPhase: number;
  progress: Record<number, AiePhaseProgress>;
  onSelect: (n: number) => void;
}

export default function PhaseSidebar({ selectedPhase, progress, onSelect }: Props) {
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
        12 phases · capstone · appendix
      </p>
      {AIE_PHASES.map((p) => {
        const done = isAiePhaseComplete(p.num, progress);
        const isSelected = p.num === selectedPhase;
        const isCapstone = p.kind === "capstone";
        const isAppendix = p.kind === "appendix";
        const special = isCapstone || isAppendix;

        return (
          <button
            key={p.num}
            onClick={() => onSelect(p.num)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px",
              borderRadius: 10,
              border: isSelected ? "1px solid var(--gha-blue)" : "1px solid transparent",
              background: isSelected ? "var(--gha-blue-soft)" : "transparent",
              boxShadow: isSelected ? "0 0 0 3px var(--gha-blue-glow)" : "none",
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
                : special
                ? "var(--gha-purple)"
                : "var(--gha-bg-surface)",
              color: done || isSelected || special ? "#fff" : "var(--gha-text-muted)",
              border: done || isSelected || special ? "1px solid transparent" : "1px solid var(--gha-border)",
              transition: "all 0.18s",
            }}>
              {done ? "✓" : isCapstone ? "★" : isAppendix ? "?" : String(p.num - 1).padStart(2, "0")}
            </span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: special
                  ? "var(--gha-purple)"
                  : isSelected
                  ? "var(--gha-blue)"
                  : "var(--gha-text-faint)",
                marginBottom: 2,
              }}>
                {p.phaseLabel}
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
                {p.title}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
