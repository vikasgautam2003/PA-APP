"use client";

import { useMemo, useState } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import DayCard from "@/components/fde/DayCard";
import MonthSidebar from "@/components/fde/MonthSidebar";
import ChatPanel from "@/components/fde/ChatPanel";
import { useFde, computeOverallProgress, isDayComplete, findCurrentDay } from "@/hooks/useFde";
import { FDE_DAYS, getDay } from "@/lib/fde-roadmap";

export default function FdePage() {
  const { selectedDay, setSelectedDay, progress, isLoading, toggleTask, toggleDsa, saveNotes } = useFde();
  const [chatOpen, setChatOpen] = useState(false);

  const day = useMemo(() => getDay(selectedDay), [selectedDay]);
  const overall = useMemo(() => computeOverallProgress(progress), [progress]);
  const currentDay = useMemo(() => findCurrentDay(progress), [progress]);

  const idx = FDE_DAYS.findIndex((d) => d.day === selectedDay);
  const prev = idx > 0 ? FDE_DAYS[idx - 1].day : null;
  const next = idx >= 0 && idx < FDE_DAYS.length - 1 ? FDE_DAYS[idx + 1].day : null;

  const isOnCurrent = selectedDay === currentDay;
  const dayProgress = progress[selectedDay];
  const dayDone = !!day && isDayComplete(day.day, progress);

  return (
    <PageWrapper
      title="FDE Preparation"
      subtitle="90-day roadmap · Implementation Intern → Forward Deployed Engineer"
      action={
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-faint)" }}>
              Day {String(currentDay).padStart(2, "0")} / 90
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{
                fontSize: 26, fontWeight: 700, letterSpacing: "-0.025em",
                fontVariantNumeric: "tabular-nums", lineHeight: 1,
                background: "linear-gradient(135deg, var(--accent), #a855f7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                {overall.pct}
              </span>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>%</span>
            </div>
          </div>
          {!isOnCurrent && (
            <button
              onClick={() => setSelectedDay(currentDay)}
              style={{
                padding: "9px 18px", borderRadius: 999, border: "none",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
                cursor: "pointer",
                background: "linear-gradient(135deg, var(--accent), #7c3aed)",
                color: "#fff", textTransform: "uppercase",
                boxShadow: "0 4px 16px var(--accent-glow)",
                transition: "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px) scale(1.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0) scale(1)"; }}
            >
              ★ Today
            </button>
          )}
        </div>
      }
    >
      {isLoading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400, color: "var(--text-faint)", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Loading
        </div>
      ) : !day ? (
        <p style={{ color: "var(--text-muted)" }}>Day not found.</p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: 40,
          alignItems: "start",
          maxWidth: 1280, margin: "0 auto",
        }}>
          {/* Left: month accordion */}
          <aside style={{ position: "sticky", top: 4 }}>
            <MonthSidebar selectedDay={selectedDay} progress={progress} onSelect={setSelectedDay} />
          </aside>

          {/* Center: day */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
            {/* Inline nav strip */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 4px",
            }}>
              <button
                onClick={() => prev && setSelectedDay(prev)}
                disabled={!prev}
                style={{
                  padding: "6px 12px", borderRadius: 999,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
                  cursor: prev ? "pointer" : "not-allowed",
                  color: prev ? "var(--text-secondary)" : "var(--text-faint)",
                  fontVariantNumeric: "tabular-nums",
                  transition: "all 0.2s",
                  opacity: prev ? 1 : 0.5,
                }}
              >
                ← Day {prev ? String(prev).padStart(2, "0") : "—"}
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                {selectedDay === currentDay ? (
                  <span style={{
                    color: "#fff", padding: "4px 12px", borderRadius: 999,
                    background: "linear-gradient(135deg, var(--accent), #a855f7)",
                    boxShadow: "0 0 16px var(--accent-glow)",
                    animation: "fde-pulse 2.4s ease-in-out infinite",
                  }}>● Current</span>
                ) : dayDone ? (
                  <span style={{ color: "var(--easy)" }}>
                    ✓ Done{dayProgress?.completedAt ? ` · ${new Date(dayProgress.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}
                  </span>
                ) : (
                  <span style={{ color: "var(--text-faint)" }}>○ Pending</span>
                )}
              </div>
              <button
                onClick={() => next && setSelectedDay(next)}
                disabled={!next}
                style={{
                  padding: "6px 12px", borderRadius: 999,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
                  cursor: next ? "pointer" : "not-allowed",
                  color: next ? "var(--text-secondary)" : "var(--text-faint)",
                  fontVariantNumeric: "tabular-nums",
                  transition: "all 0.2s",
                  opacity: next ? 1 : 0.5,
                }}
              >
                Day {next ? String(next).padStart(2, "0") : "—"} →
              </button>
            </div>

            <DayCard
              day={day}
              progress={dayProgress}
              onToggleTask={() => void toggleTask(day.day)}
              onToggleDsa={() => void toggleDsa(day.day)}
              onSaveNotes={(notes) => void saveNotes(day.day, notes)}
            />
          </div>

        </div>
      )}

      {/* Floating Siri-style orb + modal overlay */}
      {!isLoading && day && (
        <ChatPanel day={day} open={chatOpen} onToggle={() => setChatOpen((v) => !v)} />
      )}
    </PageWrapper>
  );
}
