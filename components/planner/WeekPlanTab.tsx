"use client";

import { useState } from "react";
import type { WeekPlan, DayPlan, DayPlanItem } from "@/types";
import TaskCheckbox from "./TaskCheckbox";

interface Props {
  plan: WeekPlan | null;
  isGenerating: boolean;
  onGenerate: () => Promise<void>;
  onDelete: () => Promise<void>;
  onImprovise: (instruction: string) => Promise<void>;
  onMarkDone: (dayDate: string, itemId: number, type: "subtopic" | "dsa") => Promise<boolean>;
}

const STATUS_STYLES: Record<string, { border: string; bg: string; dot: string; label: string }> = {
  green:   { border: "#16a34a40", bg: "#16a34a08", dot: "var(--easy)",   label: "Complete" },
  amber:   { border: "#d9770640", bg: "#d9770608", dot: "var(--medium)", label: "Partial"  },
  red:     { border: "#dc262640", bg: "#dc262608", dot: "var(--hard)",   label: "Missed"   },
  pending: { border: "var(--border)", bg: "var(--bg-elevated)", dot: "var(--border-subtle)", label: "Upcoming" },
  rest:    { border: "var(--border)", bg: "var(--bg-hover)",    dot: "var(--text-faint)",    label: "Rest"     },
};

const DIFF_COLOR: Record<string, string> = {
  Easy: "var(--easy)", Medium: "var(--medium)", Hard: "var(--hard)",
};

export default function WeekPlanTab({ plan, isGenerating, onGenerate, onDelete, onImprovise, onMarkDone }: Props) {

  const today = new Date().toISOString().split("T")[0];

  const [improveText, setImproveText] = useState("");
  const [improving,   setImproving]   = useState(false);
  const [showDelete,  setShowDelete]  = useState(false);

  async function handleImprovise() {
    if (!improveText.trim() || improving) return;
    setImproving(true);
    await onImprovise(improveText.trim());
    setImproveText("");
    setImproving(false);
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Header actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            {plan && (
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Week of {new Date(plan.week_start + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
                {" · "}Generated {new Date(plan.generated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {plan && (
              showDelete ? (
                <button onClick={async () => { await onDelete(); setShowDelete(false); }} style={{
                  padding: "9px 18px", borderRadius: 9, fontSize: 12, fontWeight: 600,
                  cursor: "pointer", border: "none",
                  background: "var(--hard-bg)", color: "var(--hard)",
                }} onMouseLeave={() => setShowDelete(false)}>
                  Confirm Delete?
                </button>
              ) : (
                <button onClick={() => setShowDelete(true)} style={{
                  padding: "9px 18px", borderRadius: 9, fontSize: 12, fontWeight: 500,
                  cursor: "pointer", border: "1px solid var(--border)",
                  background: "transparent", color: "var(--text-muted)",
                  transition: "all 0.15s",
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--hard)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--hard-bg)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
                >
                  🗑 Delete Plan
                </button>
              )
            )}

            <button onClick={onGenerate} disabled={isGenerating} style={{
              padding: "10px 24px", borderRadius: 10, border: "none",
              fontSize: 13, fontWeight: 600,
              cursor: isGenerating ? "not-allowed" : "pointer",
              background: isGenerating ? "var(--border)" : "var(--accent)",
              color: isGenerating ? "var(--text-muted)" : "#fff",
              boxShadow: isGenerating ? "none" : "0 0 16px var(--accent-glow)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              {isGenerating ? (
                <>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #fff4", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} />
                  {improving ? "Improving…" : "Generating…"}
                </>
              ) : plan ? "↺ Regenerate" : "✦ Generate Week Plan"}
            </button>
          </div>
        </div>

        {/* Improvise bar — only shows when plan exists */}
        {plan && (
          <div style={{
            border: "1px solid var(--border)", borderRadius: 12,
            padding: "12px 16px", background: "var(--bg-elevated)",
            display: "flex", gap: 10, alignItems: "center",
          }}>
            <span style={{ fontSize: 13 }}>✦</span>
            <input
              value={improveText}
              onChange={(e) => setImproveText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleImprovise()}
              placeholder='Tell AI to adjust the plan… e.g. "Move all hard questions to Friday" or "I only have 30 mins on Wednesday"'
              style={{
                flex: 1, padding: "9px 14px", borderRadius: 9,
                border: "1px solid var(--border)", fontSize: 13,
                color: "var(--text-primary)", background: "var(--bg-surface)", outline: "none",
              }}
              onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
            />
            <button
              onClick={handleImprovise}
              disabled={!improveText.trim() || isGenerating}
              style={{
                padding: "9px 20px", borderRadius: 9, fontSize: 12, fontWeight: 600,
                cursor: !improveText.trim() || isGenerating ? "not-allowed" : "pointer",
                border: "none",
                background: !improveText.trim() || isGenerating ? "var(--border)" : "var(--accent)",
                color: !improveText.trim() || isGenerating ? "var(--text-muted)" : "#fff",
                boxShadow: !improveText.trim() || isGenerating ? "none" : "0 0 12px var(--accent-glow)",
                whiteSpace: "nowrap",
              }}
            >
              Improvise
            </button>
          </div>
        )}

        {!plan ? (
          <div style={{
            border: "1px solid var(--border)", borderRadius: 16,
            padding: "64px 24px", background: "var(--bg-elevated)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
          }}>
            <div style={{ fontSize: 48 }}>▦</div>
            <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              No plan for this week yet
            </p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", maxWidth: 360 }}>
              Add topics in the Topics tab, then generate your personalized weekly plan
            </p>
            <button onClick={onGenerate} disabled={isGenerating} style={{
              padding: "12px 32px", borderRadius: 12, border: "none",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              background: "var(--accent)", color: "#fff",
              boxShadow: "0 0 24px var(--accent-glow)",
            }}>
              ✦ Generate Week Plan
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {plan.days.map((day) => {
              const isToday  = day.date === today;
              const isPast   = day.date < today;
              const style    = STATUS_STYLES[day.status] ?? STATUS_STYLES.pending;
              const doneCount = day.items.filter((i) => i.is_done).length;

              return (
                <div key={day.date} style={{
                  border: `1px solid ${isToday ? "var(--accent)" : style.border}`,
                  borderRadius: 16, background: style.bg, overflow: "hidden",
                  boxShadow: isToday ? "0 0 0 2px var(--accent-glow)" : "none",
                  transition: "all 0.2s",
                }}>
                  {/* Day header */}
                  <div style={{
                    padding: "14px 16px 12px",
                    borderBottom: `1px solid ${style.border}`,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: style.dot, boxShadow: day.status === "green" ? "0 0 8px var(--easy)" : "none" }} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: isToday ? "var(--accent-text)" : "var(--text-primary)" }}>
                        {day.day}
                      </span>
                      {isToday && (
                        <span style={{ fontSize: 9, fontWeight: 700, color: "var(--accent)", background: "var(--accent-glow)", padding: "1px 6px", borderRadius: 99, letterSpacing: "0.06em" }}>
                          TODAY
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {doneCount}/{day.items.length}
                      </span>
                      {day.status !== "pending" && (
                        <span style={{ fontSize: 10, fontWeight: 600, color: style.dot, background: `${style.dot}20`, padding: "1px 7px", borderRadius: 99 }}>
                          {style.label}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                    {day.status === "rest" ? (
                      <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>
                        🌿 Rest day
                      </p>
                    ) : day.items.length === 0 ? (
                      <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>
                        No tasks
                      </p>
                    ) : (
                      day.items.map((item) => (
                        <div key={`${item.type}-${item.id}`} style={{
                          display: "flex", alignItems: "flex-start", gap: 10,
                          padding: "8px 10px", borderRadius: 10,
                          background: item.is_done ? "transparent" : "var(--bg-hover)",
                          border: `1px solid ${item.is_done ? "transparent" : "var(--border)"}`,
                          transition: "all 0.2s",
                        }}>
                          <TaskCheckbox
                            done={item.is_done}
                            onCheck={() => onMarkDone(day.date, item.id, item.type)}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              fontSize: 12, fontWeight: 500,
                              color: item.is_done ? "var(--text-muted)" : "var(--text-primary)",
                              textDecoration: item.is_done ? "line-through" : "none",
                              lineHeight: 1.4, marginBottom: 4,
                            }}>
                              {item.label}
                            </p>
                            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                              {item.type === "dsa" && item.difficulty && (
                                <span style={{
                                  fontSize: 9, fontWeight: 700,
                                  color: DIFF_COLOR[item.difficulty] ?? "var(--text-muted)",
                                  background: `${DIFF_COLOR[item.difficulty] ?? "transparent"}15`,
                                  padding: "1px 6px", borderRadius: 99,
                                }}>
                                  {item.difficulty}
                                </span>
                              )}
                              {item.topic && (
                                <span style={{ fontSize: 9, color: "var(--text-faint)", background: "var(--bg-elevated)", padding: "1px 6px", borderRadius: 99, border: "1px solid var(--border)" }}>
                                  {item.topic}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
