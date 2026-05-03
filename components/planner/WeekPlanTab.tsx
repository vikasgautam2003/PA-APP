"use client";

import { useState } from "react";
import type { WeekPlan, QuickSession } from "@/types";
import TaskCheckbox from "./TaskCheckbox";

interface Props {
  plan: WeekPlan | null;
  isGenerating: boolean;
  onGenerate: () => Promise<void>;
  onDelete: () => Promise<void>;
  onImprovise: (instruction: string) => Promise<void>;
  onMarkDone: (dayDate: string, itemId: number, type: "subtopic" | "dsa") => Promise<boolean>;
  quickSession: QuickSession | null;
  isSessionLoading: boolean;
  onQuickSession: (topic: string) => Promise<void>;
}

const STATUS_STYLES: Record<string, { border: string; bg: string; headerBg: string; dot: string; label: string; labelColor: string }> = {
  green:   { border: "var(--easy)",   bg: "var(--easy-bg)",   headerBg: "var(--easy-bg)",    dot: "var(--easy)",   label: "Complete", labelColor: "var(--easy)"   },
  amber:   { border: "var(--medium)", bg: "var(--medium-bg)", headerBg: "var(--medium-bg)",  dot: "var(--medium)", label: "Partial",  labelColor: "var(--medium)" },
  red:     { border: "var(--hard)",   bg: "var(--hard-bg)",   headerBg: "var(--hard-bg)",    dot: "var(--hard)",   label: "Missed",   labelColor: "var(--hard)"   },
  pending: { border: "var(--border)", bg: "var(--bg-elevated)", headerBg: "var(--bg-base)",  dot: "var(--text-faint)", label: "Upcoming", labelColor: "var(--text-muted)" },
  rest:    { border: "var(--border)", bg: "var(--bg-elevated)", headerBg: "var(--bg-base)",  dot: "var(--border)",     label: "Rest",     labelColor: "var(--text-muted)" },
};

const DIFF_COLOR: Record<string, string> = {
  Easy: "var(--easy)", Medium: "var(--medium)", Hard: "var(--hard)",
};
const DIFF_BG: Record<string, string> = {
  Easy: "var(--easy-bg)", Medium: "var(--medium-bg)", Hard: "var(--hard-bg)",
};

export default function WeekPlanTab({ plan, isGenerating, onGenerate, onDelete, onImprovise, onMarkDone, quickSession, isSessionLoading, onQuickSession }: Props) {

  const today = new Date().toISOString().split("T")[0];

  const [improveText,   setImproveText]   = useState("");
  const [improving,     setImproving]     = useState(false);
  const [showDelete,    setShowDelete]    = useState(false);
  const [sessionTopic,  setSessionTopic]  = useState("");

  async function handleQuickSession() {
    if (isSessionLoading) return;
    await onQuickSession(sessionTopic.trim());
  }

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

        {/* ── DSA TRAINER ── */}
        <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg-elevated)" }}>

          {/* Header + input */}
          <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent-glow)", border: "1px solid var(--accent-glow)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              🎯
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                DSA Trainer
              </p>
              <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>
                2 exercises from your tracker · 1 topic from your queue
              </p>
            </div>
            <input
              value={sessionTopic}
              onChange={(e) => setSessionTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuickSession()}
              placeholder="e.g. Arrays easy · DP medium · Graphs"
              style={{
                width: 240, padding: "9px 14px", borderRadius: 9,
                border: "1px solid var(--border)", fontSize: 12,
                color: "var(--text-primary)", background: "var(--bg-surface)", outline: "none",
              }}
              onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
            />
            <button
              onClick={handleQuickSession}
              disabled={isSessionLoading}
              style={{
                padding: "9px 22px", borderRadius: 9, border: "none", fontSize: 13, fontWeight: 600,
                cursor: isSessionLoading ? "not-allowed" : "pointer",
                background: isSessionLoading ? "var(--border)" : "var(--accent)",
                color: isSessionLoading ? "var(--text-muted)" : "#fff",
                boxShadow: isSessionLoading ? "none" : "0 0 12px var(--accent-glow)",
                display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
              }}
            >
              {isSessionLoading ? (
                <>
                  <div style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid #fff4", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} />
                  Loading…
                </>
              ) : "Get Tasks"}
            </button>
          </div>

          {/* Results */}
          {quickSession && !isSessionLoading && (
            <>
              <div style={{ height: 1, background: "var(--border)" }} />

              {/* AI-generated notice */}
              {quickSession.ai_generated && (
                <div style={{ padding: "8px 20px", background: "var(--medium-bg)", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 11 }}>✦</span>
                  <span style={{ fontSize: 11, color: "var(--medium)" }}>
                    Topic not found in your tracker — AI recommended these exercises instead
                  </span>
                </div>
              )}

              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>

                {/* Section label */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                    Today&apos;s Practice Set
                  </span>
                  {quickSession.difficulty && quickSession.difficulty !== "Mixed" && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: "1px 8px", borderRadius: 99,
                      color: DIFF_COLOR[quickSession.difficulty] ?? "var(--text-muted)",
                      background: DIFF_BG[quickSession.difficulty] ?? "var(--border)",
                      border: `1px solid ${DIFF_COLOR[quickSession.difficulty] ?? "var(--border)"}`,
                    }}>
                      {quickSession.difficulty}
                    </span>
                  )}
                </div>

                {/* DSA Exercise 1 */}
                {quickSession.dsa_tasks[0] && (
                  <div style={{
                    padding: "14px 16px", borderRadius: 12,
                    background: "var(--bg-surface)", border: "1px solid var(--border)",
                    display: "flex", gap: 14, alignItems: "flex-start",
                  }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent-glow)", border: "1px solid var(--accent-glow)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "var(--accent)" }}>1</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--accent)" }}>
                        Exercise 1 — {quickSession.ai_generated ? "AI Recommended" : "From Your Tracker"}
                      </p>
                      <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4 }}>
                        {quickSession.dsa_tasks[0].label}
                      </p>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {quickSession.dsa_tasks[0].difficulty && (
                          <span style={{
                            fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
                            color: DIFF_COLOR[quickSession.dsa_tasks[0].difficulty] ?? "var(--text-muted)",
                            background: DIFF_BG[quickSession.dsa_tasks[0].difficulty] ?? "var(--border)",
                          }}>
                            {quickSession.dsa_tasks[0].difficulty}
                          </span>
                        )}
                        {quickSession.dsa_tasks[0].topic && (
                          <span style={{ fontSize: 9, color: "var(--text-faint)", background: "var(--bg-elevated)", padding: "2px 7px", borderRadius: 99, border: "1px solid var(--border)" }}>
                            {quickSession.dsa_tasks[0].topic}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* DSA Exercise 2 */}
                {quickSession.dsa_tasks[1] && (
                  <div style={{
                    padding: "14px 16px", borderRadius: 12,
                    background: "var(--bg-surface)", border: "1px solid var(--border)",
                    display: "flex", gap: 14, alignItems: "flex-start",
                  }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent-glow)", border: "1px solid var(--accent-glow)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "var(--accent)" }}>2</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--accent)" }}>
                        Exercise 2 — {quickSession.ai_generated ? "AI Recommended" : "From Your Tracker"}
                      </p>
                      <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4 }}>
                        {quickSession.dsa_tasks[1].label}
                      </p>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {quickSession.dsa_tasks[1].difficulty && (
                          <span style={{
                            fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
                            color: DIFF_COLOR[quickSession.dsa_tasks[1].difficulty] ?? "var(--text-muted)",
                            background: DIFF_BG[quickSession.dsa_tasks[1].difficulty] ?? "var(--border)",
                          }}>
                            {quickSession.dsa_tasks[1].difficulty}
                          </span>
                        )}
                        {quickSession.dsa_tasks[1].topic && (
                          <span style={{ fontSize: 9, color: "var(--text-faint)", background: "var(--bg-elevated)", padding: "2px 7px", borderRadius: 99, border: "1px solid var(--border)" }}>
                            {quickSession.dsa_tasks[1].topic}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                  <span style={{ fontSize: 9, fontWeight: 600, color: "var(--text-faint)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Topic Queue</span>
                  <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                </div>

                {/* Topic task */}
                <div style={{
                  padding: "14px 16px", borderRadius: 12,
                  background: "var(--bg-surface)", border: "1px solid var(--border)",
                  display: "flex", gap: 14, alignItems: "flex-start",
                }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--easy-bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <span style={{ fontSize: 13 }}>📚</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--easy)" }}>
                      Study Task — From Your Queue
                    </p>
                    <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4 }}>
                      {quickSession.topic_task.label}
                    </p>
                    {quickSession.topic_task.topic && (
                      <span style={{ fontSize: 9, color: "var(--text-faint)", background: "var(--bg-elevated)", padding: "2px 7px", borderRadius: 99, border: "1px solid var(--border)" }}>
                        {quickSession.topic_task.topic}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </>
          )}
        </div>

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
              const style    = STATUS_STYLES[day.status] ?? STATUS_STYLES.pending;
              const doneCount = day.items.filter((i) => i.is_done).length;

              return (
                <div key={day.date} style={{
                  border: `2px solid ${isToday ? "#2563eb" : style.border}`,
                  borderRadius: 16,
                  background: style.bg,
                  overflow: "hidden",
                  boxShadow: isToday
                    ? "0 0 0 3px #2563eb25, var(--shadow-card)"
                    : day.status === "green" ? "0 0 0 2px #16a34a20, var(--shadow-card)"
                    : day.status === "amber" ? "0 0 0 2px #d9770620, var(--shadow-card)"
                    : day.status === "red"   ? "0 0 0 2px #dc262620, var(--shadow-card)"
                    : "var(--shadow-card)",
                  transition: "all 0.25s ease",
                }}>
                  {/* Day header */}
                  <div style={{
                    padding: "12px 16px 10px",
                    borderBottom: `1px solid ${style.border}`,
                    background: style.headerBg,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 9, height: 9, borderRadius: "50%",
                        background: style.dot,
                        boxShadow: day.status === "green" ? "0 0 6px #16a34a" : day.status === "amber" ? "0 0 6px #d97706" : "none",
                      }} />
                      <span style={{
                        fontSize: 14, fontWeight: 700,
                        color: isToday ? "#2563eb" : day.status !== "pending" ? style.dot : "var(--text-primary)",
                      }}>
                        {day.day}
                      </span>
                      {isToday && (
                        <span style={{
                          fontSize: 9, fontWeight: 800, color: "#fff",
                          background: "#2563eb", padding: "2px 7px",
                          borderRadius: 99, letterSpacing: "0.06em",
                          boxShadow: "0 0 8px #2563eb60",
                        }}>TODAY</span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "#6b7280" }}>
                        {doneCount}/{day.items.length}
                      </span>
                      {day.status !== "pending" && day.status !== "rest" && (
                        <span style={{
                          fontSize: 10, fontWeight: 700,
                          color: style.labelColor,
                          background: `${style.dot}20`,
                          padding: "2px 8px", borderRadius: 99,
                          border: `1px solid ${style.dot}40`,
                        }}>
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
                          padding: "10px 12px", borderRadius: 10,
                          background: item.is_done ? "transparent" : "var(--bg-surface)",
                          border: `1px solid ${item.is_done ? "transparent" : "var(--border)"}`,
                          boxShadow: item.is_done ? "none" : "var(--shadow-card)",
                          transition: "all 0.2s",
                          opacity: item.is_done ? 0.6 : 1,
                        }}>
                          <TaskCheckbox
                            done={item.is_done}
                            onCheck={() => onMarkDone(day.date, item.id, item.type).then(() => {})}
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
                                  background: DIFF_BG[item.difficulty] ?? "var(--border)",
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
