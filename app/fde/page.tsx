"use client";

import { useMemo } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import DayCard from "@/components/fde/DayCard";
import Timeline from "@/components/fde/Timeline";
import MonthSidebar from "@/components/fde/MonthSidebar";
import { useFde, computeOverallProgress, isDayComplete, findCurrentDay } from "@/hooks/useFde";
import { FDE_DAYS, getDay } from "@/lib/fde-roadmap";

export default function FdePage() {
  const { selectedDay, setSelectedDay, progress, isLoading, toggleTask, toggleDsa, saveNotes } = useFde();

  const day = useMemo(() => getDay(selectedDay), [selectedDay]);
  const overall = useMemo(() => computeOverallProgress(progress), [progress]);
  const currentDay = useMemo(() => findCurrentDay(progress), [progress]);

  const prevDay = FDE_DAYS.findIndex((d) => d.day === selectedDay) - 1;
  const nextDay = FDE_DAYS.findIndex((d) => d.day === selectedDay) + 1;
  const prev = prevDay >= 0 ? FDE_DAYS[prevDay].day : null;
  const next = nextDay < FDE_DAYS.length ? FDE_DAYS[nextDay].day : null;

  const isOnCurrent = selectedDay === currentDay;
  const dayProgress = progress[selectedDay];
  const dayLocked = !!day && !isDayComplete(day.day, progress);

  return (
    <PageWrapper
      title="FDE Preparation"
      subtitle="90-day roadmap · Implementation Intern → Forward Deployed Engineer"
      action={
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Overall · Day {currentDay} / 90
            </p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
              {overall.done}/{overall.total} done · {overall.pct}%
            </p>
          </div>
          <div style={{ width: 160, height: 6, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${overall.pct}%`,
              background: "linear-gradient(90deg, var(--accent), var(--easy))",
              borderRadius: 99, transition: "width 0.5s ease",
            }} />
          </div>
          {!isOnCurrent && (
            <button onClick={() => setSelectedDay(currentDay)} style={{
              padding: "7px 14px", borderRadius: 8, border: "none",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: "var(--accent)", color: "#fff",
              boxShadow: "0 0 12px var(--accent-glow)",
            }}>
              Jump to today
            </button>
          )}
        </div>
      }
    >
      {isLoading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "var(--text-muted)", fontSize: 13 }}>
          Loading roadmap…
        </div>
      ) : !day ? (
        <p style={{ color: "var(--text-muted)" }}>Day not found.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20, alignItems: "start" }}>
          <MonthSidebar selectedDay={selectedDay} progress={progress} onSelect={setSelectedDay} />

          <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
            {/* Prev/Next nav */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <button
                onClick={() => prev && setSelectedDay(prev)}
                disabled={!prev}
                style={{
                  padding: "8px 14px", borderRadius: 9,
                  border: "1px solid var(--border)",
                  background: "var(--bg-elevated)",
                  color: prev ? "var(--text-secondary)" : "var(--text-faint)",
                  fontSize: 12, fontWeight: 600,
                  cursor: prev ? "pointer" : "not-allowed",
                  opacity: prev ? 1 : 0.4,
                }}
              >
                ← Day {prev ?? "—"}
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {dayLocked ? (
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>○ Not yet completed</span>
                ) : (
                  <span style={{ fontSize: 11, color: "var(--easy)", fontWeight: 600 }}>✓ Completed{dayProgress?.completedAt ? ` · ${new Date(dayProgress.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}</span>
                )}
                {selectedDay === currentDay && (
                  <span style={{
                    fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 99,
                    color: "#fff", background: "var(--accent)", letterSpacing: "0.06em",
                    boxShadow: "0 0 8px var(--accent-glow)",
                  }}>CURRENT</span>
                )}
              </div>
              <button
                onClick={() => next && setSelectedDay(next)}
                disabled={!next}
                style={{
                  padding: "8px 14px", borderRadius: 9,
                  border: "1px solid var(--border)",
                  background: "var(--bg-elevated)",
                  color: next ? "var(--text-secondary)" : "var(--text-faint)",
                  fontSize: 12, fontWeight: 600,
                  cursor: next ? "pointer" : "not-allowed",
                  opacity: next ? 1 : 0.4,
                }}
              >
                Day {next ?? "—"} →
              </button>
            </div>

            <DayCard
              day={day}
              progress={dayProgress}
              onToggleTask={() => void toggleTask(day.day)}
              onToggleDsa={() => void toggleDsa(day.day)}
              onSaveNotes={(notes) => void saveNotes(day.day, notes)}
            />

            {/* 90-day timeline */}
            <Timeline selectedDay={selectedDay} progress={progress} onSelect={setSelectedDay} />

            <div style={{ display: "flex", gap: 14, fontSize: 11, color: "var(--text-muted)", padding: "0 4px" }}>
              <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: "var(--easy)", verticalAlign: "middle", marginRight: 5 }} />Done</span>
              <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: "var(--bg-surface)", border: "1px solid var(--border)", verticalAlign: "middle", marginRight: 5 }} />Pending</span>
              <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: "var(--accent-glow)", border: "2px solid var(--accent)", verticalAlign: "middle", marginRight: 5 }} />Capstone (◆)</span>
              <span>🌿 Rest day</span>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
