"use client";

import { useMemo, useState } from "react";
import DayCard from "@/components/aws/DayCard";
import PhaseSidebar from "@/components/aws/PhaseSidebar";
import ChatPanel from "@/components/aws/ChatPanel";
import { useAws, isAwsDayComplete, findCurrentAwsDay } from "@/hooks/useAws";
import { AWS_DAYS, getAwsDay } from "@/lib/aws-roadmap";

export default function AwsShell() {
  const {
    selectedDay,
    setSelectedDay,
    progress,
    isLoading,
    toggleTask,
    setSectionIndex,
    saveNotes,
  } = useAws();
  const [chatOpen, setChatOpen] = useState(false);

  const day = useMemo(() => getAwsDay(selectedDay), [selectedDay]);
  const currentDay = useMemo(() => findCurrentAwsDay(progress), [progress]);

  const idx = AWS_DAYS.findIndex((d) => d.day === selectedDay);
  const prev = idx > 0 ? AWS_DAYS[idx - 1].day : null;
  const next = idx >= 0 && idx < AWS_DAYS.length - 1 ? AWS_DAYS[idx + 1].day : null;

  const dayProgress = progress[selectedDay];
  const dayDone = !!day && isAwsDayComplete(day.day, progress);

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

  if (!day) return <p style={{ color: "var(--text-muted)" }}>Day not found.</p>;

  return (
    <>
      <div style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        gap: 40,
        alignItems: "start",
      }}>
        <aside style={{ position: "sticky", top: 4 }}>
          <PhaseSidebar selectedDay={selectedDay} progress={progress} onSelect={setSelectedDay} />
        </aside>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 4px",
          }}>
            <button onClick={() => prev && setSelectedDay(prev)} disabled={!prev} style={navBtn(!!prev)}>
              ← Day {prev ? String(prev).padStart(2, "0") : "—"}
            </button>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
            }}>
              {selectedDay === currentDay ? (
                <span style={{
                  color: "#fff", padding: "4px 12px", borderRadius: 999,
                  background: "linear-gradient(135deg, var(--accent), #7c3aed)",
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
            <button onClick={() => next && setSelectedDay(next)} disabled={!next} style={navBtn(!!next)}>
              Day {next ? String(next).padStart(2, "0") : "—"} →
            </button>
          </div>

          <DayCard
            day={day}
            progress={dayProgress}
            onToggleTask={() => void toggleTask(day.day)}
            onSectionChange={(i) => void setSectionIndex(day.day, i)}
            onSaveNotes={(notes) => void saveNotes(day.day, notes)}
          />
        </div>
      </div>
      <ChatPanel day={day} open={chatOpen} onToggle={() => setChatOpen((v) => !v)} />
    </>
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
