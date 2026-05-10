"use client";

import { useEffect, useState } from "react";
import { AWS_DAYS, AWS_PHASES } from "@/lib/aws-roadmap";
import { isAwsDayComplete } from "@/hooks/useAws";
import type { AwsDayProgress } from "@/types";

interface Props {
  selectedDay: number;
  progress: Record<number, AwsDayProgress>;
  onSelect: (day: number) => void;
}

export default function PhaseSidebar({ selectedDay, progress, onSelect }: Props) {
  const selectedPhase = AWS_DAYS.find((d) => d.day === selectedDay)?.phase ?? 1;
  const [openPhase, setOpenPhase] = useState<number>(selectedPhase);

  useEffect(() => {
    setOpenPhase(selectedPhase);
  }, [selectedPhase]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {AWS_PHASES.map((p) => {
        const phaseDays = AWS_DAYS.filter((d) => d.phase === p.phase);
        const phaseDone = phaseDays.filter((d) => isAwsDayComplete(d.day, progress)).length;
        const phasePct = Math.round((phaseDone / phaseDays.length) * 100);
        const isOpen = openPhase === p.phase;
        const isCurrent = p.phase === selectedPhase;

        return (
          <section
            key={p.phase}
            style={{
              border: "1px solid",
              borderColor: isCurrent ? "var(--aws-orange)" : "var(--border)",
              borderRadius: 14,
              background: isCurrent
                ? "linear-gradient(180deg, var(--aws-orange-soft) 0%, var(--bg-elevated) 80%)"
                : "var(--bg-elevated)",
              overflow: "hidden",
              transition: "border-color 0.25s, background 0.25s",
            }}
          >
            <button
              onClick={() => setOpenPhase(isOpen ? -1 : p.phase)}
              style={{
                width: "100%", padding: "14px 16px",
                background: "transparent", border: "none",
                cursor: "pointer", textAlign: "left",
                display: "flex", flexDirection: "column", gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.18em",
                  color: isCurrent ? "var(--aws-orange)" : "var(--text-faint)",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  PHASE {p.phase} · {p.range.replace("Days ", "")}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.04em",
                  color: phasePct === 100 ? "var(--easy)" : "var(--text-muted)",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {phaseDone}/{phaseDays.length} · {phasePct}%
                </span>
              </div>
              <h3 style={{
                fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em",
                color: "var(--text-primary)", lineHeight: 1.35,
              }}>
                {p.title}
              </h3>
              <div style={{
                height: 2, background: "var(--border)",
                borderRadius: 99, overflow: "hidden",
              }}>
                <div style={{
                  height: "100%", width: `${phasePct}%`,
                  background: phasePct === 100
                    ? "linear-gradient(90deg, var(--easy), #34d399)"
                    : "linear-gradient(90deg, var(--aws-orange), #ffb84d)",
                  borderRadius: 99,
                  transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  boxShadow: phasePct > 0 ? "0 0 12px var(--aws-orange-glow)" : "none",
                }} />
              </div>
            </button>

            <div style={{
              maxHeight: isOpen ? 360 : 0,
              overflow: "hidden",
              transition: "max-height 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
            }}>
              <div style={{
                padding: "0 14px 14px",
                display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5,
                opacity: isOpen ? 1 : 0,
                transition: "opacity 0.3s ease",
                transitionDelay: isOpen ? "0.15s" : "0s",
              }}>
                {phaseDays.map((d, i) => {
                  const done = isAwsDayComplete(d.day, progress);
                  const isSelected = d.day === selectedDay;
                  const isCapstone = d.kind === "capstone";
                  const isReview = d.kind === "review";

                  let bg = "transparent";
                  let color = "var(--text-faint)";
                  let border = "1px solid var(--border-subtle)";
                  let shadow = "none";

                  if (done) {
                    bg = isReview
                      ? "var(--medium-bg)"
                      : "linear-gradient(135deg, var(--easy), #34d399)";
                    color = isReview ? "var(--medium)" : "#fff";
                    border = "1px solid transparent";
                    shadow = isReview ? "none" : "0 2px 8px rgba(48,209,88,0.25)";
                  }
                  if (isSelected) {
                    bg = isCapstone
                      ? "linear-gradient(135deg, var(--aws-orange), #ffb84d)"
                      : "linear-gradient(135deg, var(--aws-orange), var(--aws-orange-dim))";
                    color = "#fff";
                    border = "1px solid var(--aws-orange)";
                    shadow = "0 4px 14px var(--aws-orange-glow)";
                  } else if (isCapstone && !done) {
                    border = "1px solid var(--aws-orange)";
                    color = "var(--aws-orange)";
                  }

                  const label = isCapstone ? "◆" : isReview ? "·" : d.day;

                  return (
                    <button
                      key={d.day}
                      onClick={() => onSelect(d.day)}
                      title={`Day ${d.day}${d.topic ? ` — ${d.topic}` : ""}`}
                      style={{
                        aspectRatio: "1", width: "100%",
                        borderRadius: 6, border,
                        background: bg, color,
                        boxShadow: shadow,
                        fontSize: 10, fontWeight: 700,
                        cursor: "pointer", padding: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontVariantNumeric: "tabular-nums",
                        transition: "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        animation: isOpen ? `fde-pop-in 0.36s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 8}ms backwards` : undefined,
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.transform = "scale(1.12)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
