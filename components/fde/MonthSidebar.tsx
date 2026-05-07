"use client";

import { FDE_DAYS, FDE_MONTHS } from "@/lib/fde-roadmap";
import { isDayComplete } from "@/hooks/useFde";
import type { FdeDayProgress } from "@/types";

interface Props {
  selectedDay: number;
  progress: Record<number, FdeDayProgress>;
  onSelect: (day: number) => void;
}

export default function MonthSidebar({ selectedDay, progress, onSelect }: Props) {
  const currentMonth = FDE_DAYS.find((d) => d.day === selectedDay)?.month ?? 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {FDE_MONTHS.map((m) => {
        const monthDays = FDE_DAYS.filter((d) => d.month === m.month);
        const monthDone = monthDays.filter((d) => isDayComplete(d.day, progress)).length;
        const monthPct = Math.round((monthDone / monthDays.length) * 100);
        const isCurrent = m.month === currentMonth;

        return (
          <div key={m.month} style={{
            border: `1px solid ${isCurrent ? "var(--accent)" : "var(--border)"}`,
            borderRadius: 14,
            background: isCurrent ? "var(--accent-glow)" : "var(--bg-elevated)",
            overflow: "hidden",
            transition: "all 0.15s",
          }}>
            <div style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--border)",
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>
                Month {m.month}
              </p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em", lineHeight: 1.3 }}>
                {m.title}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{monthDone} / {monthDays.length} days</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: monthPct === 100 ? "var(--easy)" : "var(--accent-text)" }}>{monthPct}%</span>
              </div>
              <div style={{ height: 3, background: "var(--border)", borderRadius: 99, overflow: "hidden", marginTop: 6 }}>
                <div style={{
                  height: "100%", width: `${monthPct}%`,
                  background: monthPct === 100 ? "var(--easy)" : "var(--accent)",
                  borderRadius: 99, transition: "width 0.4s ease",
                }} />
              </div>
            </div>
            <div style={{ padding: "8px 12px 12px" }}>
              {m.weeks.map((w, wIdx) => {
                const weekNum = wIdx + 1;
                const weekDays = monthDays.filter((d) => d.weekInMonth === weekNum);
                if (weekDays.length === 0) return null;
                const weekDone = weekDays.filter((d) => isDayComplete(d.day, progress)).length;
                return (
                  <div key={wIdx} style={{ marginTop: wIdx === 0 ? 0 : 8 }}>
                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 5 }}>
                      {w.range} · {weekDone}/{weekDays.length}
                    </p>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      {weekDays.map((d) => {
                        const done = isDayComplete(d.day, progress);
                        const isSelected = d.day === selectedDay;
                        return (
                          <button
                            key={d.day}
                            onClick={() => onSelect(d.day)}
                            title={`Day ${d.day}${d.topic ? `: ${d.topic}` : d.kind === "rest" ? ": Rest day" : d.kind === "capstone" ? ": Capstone day" : ""}`}
                            style={{
                              width: 26, height: 26, borderRadius: 6,
                              border: isSelected
                                ? "2px solid var(--accent)"
                                : d.kind === "capstone"
                                ? "1px solid var(--accent)"
                                : "1px solid var(--border)",
                              background: done
                                ? d.kind === "rest" ? "var(--medium-bg)" : "var(--easy)"
                                : isSelected ? "var(--accent-glow)" : "var(--bg-surface)",
                              color: done && d.kind !== "rest" ? "#fff" : "var(--text-muted)",
                              fontSize: 10, fontWeight: 700,
                              cursor: "pointer", padding: 0,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                          >
                            {d.kind === "rest" ? "🌿" : d.kind === "capstone" ? "◆" : d.day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
