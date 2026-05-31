"use client";

import { useMemo } from "react";
import PhaseCard from "@/components/ai-engineer/PhaseCard";
import PhaseSidebar from "@/components/ai-engineer/PhaseSidebar";
import { useAie, isAiePhaseComplete, findCurrentAiePhase } from "@/hooks/useAie";
import { AIE_PHASES, getAiePhase } from "@/lib/aie-roadmap";

export default function AiEngineerShell() {
  const {
    selectedPhase,
    setSelectedPhase,
    progress,
    isLoading,
    toggleDone,
    setSectionIndex,
    saveNotes,
  } = useAie();

  const phase = useMemo(() => getAiePhase(selectedPhase), [selectedPhase]);
  const currentPhase = useMemo(() => findCurrentAiePhase(progress), [progress]);

  const idx = AIE_PHASES.findIndex((p) => p.num === selectedPhase);
  const prev = idx > 0 ? AIE_PHASES[idx - 1].num : null;
  const next = idx >= 0 && idx < AIE_PHASES.length - 1 ? AIE_PHASES[idx + 1].num : null;

  const phaseProgress = progress[selectedPhase];
  const phaseDone = !!phase && isAiePhaseComplete(phase.num, progress);

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

  if (!phase) return <p style={{ color: "var(--text-muted)" }}>Phase not found.</p>;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "260px 1fr",
      gap: 40,
      alignItems: "start",
    }}>
      <aside style={{ position: "sticky", top: 4 }}>
        <PhaseSidebar
          selectedPhase={selectedPhase}
          progress={progress}
          onSelect={setSelectedPhase}
        />
      </aside>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 4px",
        }}>
          <button onClick={() => prev && setSelectedPhase(prev)} disabled={!prev} style={navBtn(!!prev)}>
            ← {prev ? AIE_PHASES.find((p) => p.num === prev)?.phaseLabel : "—"}
          </button>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
          }}>
            {selectedPhase === currentPhase ? (
              <span style={{
                color: "#fff", padding: "4px 12px", borderRadius: 999,
                background: "linear-gradient(135deg, var(--accent), #7c3aed)",
                boxShadow: "0 0 16px var(--accent-glow)",
              }}>● Current</span>
            ) : phaseDone ? (
              <span style={{ color: "var(--easy)" }}>
                ✓ Done{phaseProgress?.completedAt ? ` · ${new Date(phaseProgress.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}
              </span>
            ) : (
              <span style={{ color: "var(--text-faint)" }}>○ Pending</span>
            )}
          </div>
          <button onClick={() => next && setSelectedPhase(next)} disabled={!next} style={navBtn(!!next)}>
            {next ? AIE_PHASES.find((p) => p.num === next)?.phaseLabel : "—"} →
          </button>
        </div>

        <PhaseCard
          phase={phase}
          progress={phaseProgress}
          onToggleDone={() => void toggleDone(phase.num)}
          onSectionChange={(i) => void setSectionIndex(phase.num, i)}
          onSaveNotes={(notes) => void saveNotes(phase.num, notes)}
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
