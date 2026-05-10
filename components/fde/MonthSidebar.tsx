"use client";

import { useEffect, useState } from "react";
import { FDE_DAYS, FDE_MONTHS } from "@/lib/fde-roadmap";
import { isDayComplete } from "@/hooks/useFde";
import type { FdeDayProgress } from "@/types";

interface Props {
  selectedDay: number;
  progress: Record<number, FdeDayProgress>;
  onSelect: (day: number) => void;
}

export default function MonthSidebar({ selectedDay, progress, onSelect }: Props) {
  const selectedMonth = FDE_DAYS.find((d) => d.day === selectedDay)?.month ?? 1;
  const [openMonth, setOpenMonth] = useState<number>(selectedMonth);

  // Auto-expand the month containing the selected day
  useEffect(() => {
    setOpenMonth(selectedMonth);
  }, [selectedMonth]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {FDE_MONTHS.map((m) => {
        const monthDays = FDE_DAYS.filter((d) => d.month === m.month);
        const monthDone = monthDays.filter((d) => isDayComplete(d.day, progress)).length;
        const monthPct = Math.round((monthDone / monthDays.length) * 100);
        const isOpen = openMonth === m.month;
        const isCurrent = m.month === selectedMonth;

        return (
          <section
            key={m.month}
            style={{
              border: "1px solid",
              borderColor: isCurrent ? "var(--accent)" : "var(--border)",
              borderRadius: 14,
              background: isCurrent ? "linear-gradient(180deg, var(--accent-glow) 0%, var(--bg-elevated) 80%)" : "var(--bg-elevated)",
              overflow: "hidden",
              transition: "border-color 0.25s, background 0.25s",
            }}
          >
            <button
              onClick={() => setOpenMonth(isOpen ? -1 : m.month)}
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
                  color: isCurrent ? "var(--accent-text)" : "var(--text-faint)",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  M{String(m.month).padStart(2, "0")}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.04em",
                  color: monthPct === 100 ? "var(--easy)" : "var(--text-muted)",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {monthDone}/{monthDays.length} · {monthPct}%
                </span>
              </div>
              <h3 style={{
                fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em",
                color: "var(--text-primary)", lineHeight: 1.35,
              }}>
                {m.title}
              </h3>
              <div style={{
                height: 2, background: "var(--border)",
                borderRadius: 99, overflow: "hidden",
              }}>
                <div style={{
                  height: "100%", width: `${monthPct}%`,
                  background: monthPct === 100
                    ? "linear-gradient(90deg, var(--easy), #34d399)"
                    : "linear-gradient(90deg, var(--accent), #a855f7)",
                  borderRadius: 99,
                  transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  boxShadow: monthPct > 0 ? "0 0 12px var(--accent-glow)" : "none",
                }} />
              </div>
            </button>

            {/* Collapsible day grid */}
            <div style={{
              maxHeight: isOpen ? 320 : 0,
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
                {monthDays.map((d, i) => {
                  const done = isDayComplete(d.day, progress);
                  const isSelected = d.day === selectedDay;
                  const isCapstone = d.kind === "capstone";
                  const isRest = d.kind === "rest";

                  let bg = "transparent";
                  let color = "var(--text-faint)";
                  let border = "1px solid var(--border-subtle)";
                  let shadow = "none";

                  if (done) {
                    bg = isRest
                      ? "var(--medium-bg)"
                      : "linear-gradient(135deg, var(--easy), #34d399)";
                    color = isRest ? "var(--medium)" : "#fff";
                    border = "1px solid transparent";
                    shadow = isRest ? "none" : "0 2px 8px rgba(48,209,88,0.25)";
                  }
                  if (isSelected) {
                    bg = isCapstone
                      ? "linear-gradient(135deg, var(--accent), #a855f7)"
                      : "linear-gradient(135deg, var(--accent), #7c3aed)";
                    color = "#fff";
                    border = "1px solid var(--accent)";
                    shadow = "0 4px 14px var(--accent-glow)";
                  } else if (isCapstone && !done) {
                    border = "1px solid var(--accent)";
                    color = "var(--accent-text)";
                  }

                  const label = isCapstone ? "◆" : isRest ? "·" : d.day;

                  return (
                    <button
                      key={d.day}
                      onClick={() => onSelect(d.day)}
                      title={`Day ${d.day}${d.topic ? ` — ${d.topic}` : isRest ? " — Rest" : isCapstone ? " — Capstone" : ""}`}
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
