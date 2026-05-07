"use client";

import { FDE_DAYS } from "@/lib/fde-roadmap";
import { isDayComplete } from "@/hooks/useFde";
import type { FdeDayProgress } from "@/types";

interface Props {
  selectedDay: number;
  progress: Record<number, FdeDayProgress>;
  onSelect: (day: number) => void;
}

const MONTH_BORDER: Record<number, string> = {
  1: "var(--accent)",
  2: "#7c3aed",
  3: "var(--easy)",
};

export default function Timeline({ selectedDay, progress, onSelect }: Props) {
  return (
    <div style={{
      border: "1px solid var(--border)", borderRadius: 14,
      background: "var(--bg-elevated)", padding: "12px 14px",
      overflowX: "auto", whiteSpace: "nowrap",
    }}>
      <div style={{ display: "flex", gap: 2, alignItems: "stretch" }}>
        {FDE_DAYS.map((d, idx) => {
          const done = isDayComplete(d.day, progress);
          const isSelected = d.day === selectedDay;
          const isMonthBoundary = idx > 0 && d.month !== FDE_DAYS[idx - 1].month;

          let bg = "transparent";
          let border = "1px solid var(--border)";
          let label: string | null = null;

          if (d.kind === "rest") {
            bg = done ? "var(--medium-bg)" : "var(--bg-surface)";
            label = "🌿";
          } else if (d.kind === "capstone") {
            bg = done ? "var(--easy)" : "var(--accent-glow)";
            border = `2px solid var(--accent)`;
            label = "◆";
          } else {
            bg = done ? "var(--easy)" : "var(--bg-surface)";
          }

          if (isSelected) {
            border = `2px solid ${MONTH_BORDER[d.month]}`;
            bg = isSelected && !done ? "var(--accent-glow)" : bg;
          }

          return (
            <div key={d.day} style={{ display: "flex", alignItems: "stretch" }}>
              {isMonthBoundary && (
                <div style={{
                  width: 1, background: "var(--border)",
                  margin: "0 6px",
                }} />
              )}
              <button
                onClick={() => onSelect(d.day)}
                title={`Day ${d.day} · M${d.month} W${d.weekInMonth}${d.kind !== "lesson" ? ` · ${d.kind}` : ""}${d.topic ? ` · ${d.topic}` : ""}`}
                style={{
                  width: 24, height: 36,
                  borderRadius: 6, border,
                  background: bg, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 700,
                  color: done && d.kind !== "rest" ? "#fff" : "var(--text-muted)",
                  padding: 0, transition: "all 0.12s",
                  position: "relative",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = MONTH_BORDER[d.month];
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.border = d.kind === "capstone" ? `2px solid var(--accent)` : "1px solid var(--border)";
                }}
              >
                {label ?? d.day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
