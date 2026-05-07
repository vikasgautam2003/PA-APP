"use client";

import Link from "next/link";
import { useFde, computeOverallProgress, findCurrentDay } from "@/hooks/useFde";
import { getDay, getMonthMeta, getCapstone } from "@/lib/fde-roadmap";

const DIFF_COLOR: Record<string, string> = {
  Easy: "var(--easy)", Medium: "var(--medium)", Hard: "var(--hard)",
};
const DIFF_BG: Record<string, string> = {
  Easy: "var(--easy-bg)", Medium: "var(--medium-bg)", Hard: "var(--hard-bg)",
};

function tierColor(tier?: string): string {
  if (!tier) return "var(--text-muted)";
  if (tier.startsWith("Easy")) return DIFF_COLOR.Easy;
  if (tier.startsWith("Medium")) return DIFF_COLOR.Medium;
  if (tier.startsWith("Hard")) return DIFF_COLOR.Hard;
  return "var(--text-muted)";
}

function tierBg(tier?: string): string {
  if (!tier) return "var(--bg-elevated)";
  if (tier.startsWith("Easy")) return DIFF_BG.Easy;
  if (tier.startsWith("Medium")) return DIFF_BG.Medium;
  if (tier.startsWith("Hard")) return DIFF_BG.Hard;
  return "var(--bg-elevated)";
}

export default function FdeDashboardCard() {
  const { progress, isLoading, toggleTask, toggleDsa } = useFde();

  const currentDayNum = findCurrentDay(progress);
  const day = getDay(currentDayNum);
  const overall = computeOverallProgress(progress);
  const monthMeta = day ? getMonthMeta(day.month) : null;
  const cap = day ? getCapstone(day.month) : null;
  const dayProgress = progress[currentDayNum];

  if (isLoading || !day) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
        Loading FDE roadmap…
      </div>
    );
  }

  const isRest = day.kind === "rest";
  const isCapstoneDay = day.kind === "capstone";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header strip */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14,
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
            FDE Day {day.day} · Month {day.month} · Week {day.weekInMonth}
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 2 }}>
            {isRest ? "Rest Day 🌿" : isCapstoneDay ? `◆ ${cap?.name ?? "Capstone"}` : day.topic}
          </h1>
          {monthMeta && (
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
              {monthMeta.title}
            </p>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {overall.done} / {overall.total} days
          </span>
          <div style={{ height: 4, width: 140, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${overall.pct}%`,
              background: "linear-gradient(90deg, var(--accent), var(--easy))",
              borderRadius: 99, transition: "width 0.4s ease",
            }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-text)", fontVariantNumeric: "tabular-nums" }}>
            {overall.pct}%
          </span>
        </div>
      </div>

      {/* Rest day */}
      {isRest && (
        <div style={{
          border: "1px solid var(--border)", borderRadius: 14,
          padding: "20px 22px", background: "var(--bg-elevated)",
          boxShadow: "var(--shadow-card)",
        }}>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 14 }}>
            No DSA. No task. Deliberate recovery is part of the system. Review the week, read a chapter, take a walk.
          </p>
          <button onClick={() => void toggleTask(day.day)} style={{
            padding: "9px 18px", borderRadius: 9, border: "none",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            background: dayProgress?.taskDone ? "var(--easy)" : "var(--accent)",
            color: "#fff",
          }}>
            {dayProgress?.taskDone ? "✓ Rest logged" : "Mark rest taken"}
          </button>
        </div>
      )}

      {/* Capstone day */}
      {isCapstoneDay && cap && (
        <div style={{
          border: "1px solid var(--accent)", borderRadius: 14,
          padding: "18px 22px", background: "var(--accent-glow)",
          boxShadow: "0 0 18px var(--accent-glow)",
        }}>
          <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.6, marginBottom: 12 }}>
            {cap.summary}
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {cap.stack.map((s) => (
              <span key={s} style={{
                fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 99,
                color: "var(--accent-text)", background: "var(--bg-surface)",
                border: "1px solid var(--accent-glow)",
              }}>{s}</span>
            ))}
          </div>
          <button onClick={() => void toggleTask(day.day)} style={{
            padding: "9px 18px", borderRadius: 9, border: "none",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            background: dayProgress?.taskDone ? "var(--easy)" : "var(--accent)",
            color: "#fff",
          }}>
            {dayProgress?.taskDone ? "✓ Capstone shipped" : "Mark capstone done"}
          </button>
        </div>
      )}

      {/* Lesson day */}
      {day.kind === "lesson" && (
        <>
          <div style={{
            border: "1px solid var(--accent)", borderRadius: 14,
            padding: "16px 20px", background: "var(--bg-elevated)",
            boxShadow: "var(--shadow-card)",
            display: "flex", alignItems: "flex-start", gap: 14,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 6 }}>
                Today&apos;s task
              </p>
              <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.55 }}>
                {day.task}
              </p>
            </div>
            <button onClick={() => void toggleTask(day.day)} style={{
              padding: "9px 16px", borderRadius: 9, border: "none",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: dayProgress?.taskDone ? "var(--easy)" : "var(--accent)",
              color: "#fff", whiteSpace: "nowrap", flexShrink: 0,
            }}>
              {dayProgress?.taskDone ? "✓ Done" : "Mark done"}
            </button>
          </div>

          {day.dsa && (
            <div style={{
              border: `1px solid ${tierColor(day.dsa.tier)}`, borderRadius: 14,
              padding: "14px 18px", background: tierBg(day.dsa.tier),
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
                    color: tierColor(day.dsa.tier), background: "var(--bg-surface)",
                    border: `1px solid ${tierColor(day.dsa.tier)}`,
                  }}>DSA · {day.dsa.tier}</span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{day.dsa.title}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace", marginTop: 2 }}>
                  {day.dsa.approach}
                </p>
              </div>
              <button onClick={() => void toggleDsa(day.day)} style={{
                padding: "9px 16px", borderRadius: 9, border: "none",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: dayProgress?.dsaDone ? "var(--easy)" : tierColor(day.dsa.tier),
                color: "#fff", whiteSpace: "nowrap", flexShrink: 0,
              }}>
                {dayProgress?.dsaDone ? "✓ Solved" : "Mark solved"}
              </button>
            </div>
          )}

          {day.whyMatters && (
            <div style={{
              border: "1px solid var(--border)", borderRadius: 14,
              padding: "14px 18px", background: "var(--bg-elevated)",
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#3b82f6", marginBottom: 6 }}>
                Why this matters
              </p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {day.whyMatters.length > 280 ? day.whyMatters.slice(0, 277) + "…" : day.whyMatters}
              </p>
            </div>
          )}
        </>
      )}

      <Link href="/fde" style={{
        textAlign: "center", padding: "11px 16px", borderRadius: 10,
        border: "1px solid var(--border)", background: "var(--bg-elevated)",
        color: "var(--text-secondary)", fontSize: 12, fontWeight: 600,
        textDecoration: "none", transition: "all 0.15s",
      }}>
        Open full roadmap →
      </Link>
    </div>
  );
}
