"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useAuthStore } from "@/store/authStore";
import { getDb } from "@/lib/db";
import { askGroqChat } from "@/lib/groq";
import { usePlanner } from "@/hooks/usePlanner";
import TaskCheckbox from "@/components/planner/TaskCheckbox";
import type { DayPlan, DayPlanItem } from "@/types";

const DIFF_COLOR: Record<string, string> = {
  Easy: "#16a34a", Medium: "#d97706", Hard: "#dc2626",
};

const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function getWeekDays() {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { currentPlan, markItemDone } = usePlanner();
  const [todayPlan, setTodayPlan] = useState<DayPlan | null>(null);
  const [brief, setBrief]         = useState<string>("");
  const [briefLoading, setBriefLoading] = useState(false);
  const [streak, setStreak]       = useState(0);
  const [dsaSolved, setDsaSolved] = useState(0);
  const [financeData, setFinanceData] = useState<{ spent: number; stipend: number; currency: string } | null>(null);
  const [promptCount, setPromptCount] = useState(0);
  const [tickingId, setTickingId] = useState<string | null>(null);

  const today     = new Date();
  const todayStr  = today.toISOString().split("T")[0];
  const todayMonth = today.toISOString().slice(0, 7);
  const todayLabel = today.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  const timeHour  = today.getHours();
  const greeting  = timeHour < 12 ? "Good morning" : timeHour < 17 ? "Good afternoon" : timeHour < 21 ? "Good evening" : "Late night grind";

  async function loadDashboardData() {
    const db = await getDb();

    // Today's plan
    if (currentPlan) {
      const day = currentPlan.days.find((d) => d.date === todayStr);
      setTodayPlan(day ?? null);


      // Streak — count consecutive green days backwards
      let s = 0;
      const sorted = [...currentPlan.days].reverse();
      for (const d of sorted) {
        if (d.date >= todayStr) continue;
        if (d.status === "green") s++;
        else break;
      }
      setStreak(s);
    }

    // DSA solved
    const dsa = await db.select<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM dsa_progress WHERE user_id = ? AND status = 'done'",
      [user!.id]
    );
    setDsaSolved(dsa[0]?.count ?? 0);

    // Finance
    const fin = await db.select<{ stipend: number | null; currency: string | null }[]>(
      "SELECT stipend, currency FROM finances WHERE user_id = ?",
      [user!.id]
    );
    if (fin.length > 0) {
      const month = todayMonth;
      const spent = await db.select<{ total: number }[]>(
        `SELECT COALESCE(SUM(amount), 0) as total FROM finance_transactions
         WHERE user_id = ? AND strftime('%Y-%m', date) = ?`,
        [user!.id, month]
      );
      setFinanceData({
        stipend:  fin[0].stipend ?? 0,
        spent:    spent[0]?.total ?? 0,
        currency: fin[0].currency ?? "₹",
      });
    }

    // Prompts
    const prompts = await db.select<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM prompts WHERE user_id = ?",
      [user!.id]
    );
    setPromptCount(prompts[0]?.count ?? 0);
  }

  useEffect(() => {
    if (!user) return;

    async function fetchDashboard() {
      const db = await getDb();

      if (currentPlan) {
        const day = currentPlan.days.find((d) => d.date === todayStr);
        setTodayPlan(day ?? null);

        let s = 0;
        const sorted = [...currentPlan.days].reverse();
        for (const d of sorted) {
          if (d.date >= todayStr) continue;
          if (d.status === "green") s++;
          else break;
        }
        setStreak(s);
      }

      const dsa = await db.select<{ count: number }[]>(
        "SELECT COUNT(*) as count FROM dsa_progress WHERE user_id = ? AND status = 'done'",
        [user!.id]
      );
      setDsaSolved(dsa[0]?.count ?? 0);

      const fin = await db.select<{ stipend: number | null; currency: string | null }[]>(
        "SELECT stipend, currency FROM finances WHERE user_id = ?",
        [user!.id]
      );
      if (fin.length > 0) {
        const month = todayMonth;
        const spent = await db.select<{ total: number }[]>(
          `SELECT COALESCE(SUM(amount), 0) as total FROM finance_transactions
           WHERE user_id = ? AND strftime('%Y-%m', date) = ?`,
          [user!.id, month]
        );
        setFinanceData({
          stipend:  fin[0].stipend ?? 0,
          spent:    spent[0]?.total ?? 0,
          currency: fin[0].currency ?? "₹",
        });
      }

      const prompts = await db.select<{ count: number }[]>(
        "SELECT COUNT(*) as count FROM prompts WHERE user_id = ?",
        [user!.id]
      );
      setPromptCount(prompts[0]?.count ?? 0);
    }

    void fetchDashboard();
  }, [user, currentPlan, todayStr, todayMonth]);

  async function generateBrief() {
    setBriefLoading(true);
    setBrief("");
    try {
      const todayItems = todayPlan?.items ?? [];
      const doneToday  = todayItems.filter((i) => i.is_done).length;
      const totalToday = todayItems.length;
      const taskList   = todayItems.map((i) =>
        `${i.is_done ? "✓" : "○"} ${i.label}${i.difficulty ? ` (${i.difficulty})` : ""}`
      ).join(", ") || "No tasks planned today";

      const systemPrompt = `You are a personal assistant inside a developer's productivity app called Ares.
Write a daily brief with exactly this structure — no extra text before or after:

**Good [time of day], [name].** (one punchy opening sentence about their day)

- **Tasks** — comment on today's tasks specifically, mention task names, give a tip or priority
- **DSA** — comment on their DSA progress, encourage or challenge them based on the number
- **Finance** — specific observation about their spending, practical advice if over budget
- **Focus** — one sharp actionable thing they should do first today

Keep each bullet to 1-2 sentences. Be specific, direct, slightly witty. Never generic.
Use the actual data provided — mention real numbers, real task names.`;

      const userMsg = `User: ${user?.username}
Today: ${todayLabel}
Streak: ${streak} consecutive days completed
Today's tasks (${doneToday}/${totalToday} done): ${taskList}
DSA solved: ${dsaSolved}/1000
Finance: ${financeData ? `${financeData.currency}${financeData.spent} spent of ${financeData.currency}${financeData.stipend} this month` : "not set up"}
Prompts saved: ${promptCount}

Write today's brief.`;

      const response = await askGroqChat(
        [{ role: "user", content: userMsg }],
        systemPrompt
      );
      setBrief(response);
    } catch (e) {
      setBrief(e instanceof Error ? e.message : "Couldn't generate brief. Check your Groq key in Settings.");
    } finally {
      setBriefLoading(false);
    }
  }

  async function handleTick(item: DayPlanItem) {
    const key = `${item.type}-${item.id}`;
    if (tickingId === key) return;
    setTickingId(key);
    await markItemDone(todayStr, item.id, item.type);
    await loadDashboardData();
    setTickingId(null);
  }

  const doneTasks  = todayPlan?.items.filter((i) => i.is_done).length ?? 0;
  const totalTasks = todayPlan?.items.length ?? 0;

  const STATUS_DOT: Record<string, { bg: string; shadow: string }> = {
    green:   { bg: "#16a34a", shadow: "0 0 6px #16a34a" },
    amber:   { bg: "#d97706", shadow: "0 0 6px #d97706" },
    red:     { bg: "#dc2626", shadow: "0 0 4px #dc2626" },
    pending: { bg: "#e5e7eb", shadow: "none" },
    rest:    { bg: "#d1d5db", shadow: "none" },
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: "var(--bg-surface)", overflow: "hidden",
    }}>

      {/* ── Top status bar ─────────────────────────────────────────────── */}
      <div style={{
        padding: "16px 40px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "var(--bg-surface)", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            {greeting},{" "}
            <span style={{ color: "var(--accent-text)" }}>{user?.username}</span>
          </span>
        </div>

        {/* Inline stats strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {[
            streak > 0 ? `${streak} day streak 🔥` : "Start your streak 💪",
            `${doneTasks}/${totalTasks} tasks today`,
            `${dsaSolved}/1000 DSA`,
            financeData ? `${financeData.currency}${Math.round(financeData.spent).toLocaleString()} spent` : null,
            `${promptCount} prompts`,
          ].filter(Boolean).map((item, i, arr) => (
            <span key={i} style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? "var(--text-primary)" : "var(--text-muted)" }}>
                {item}
              </span>
              {i < arr.length - 1 && (
                <span style={{ fontSize: 11, color: "var(--border)", margin: "0 12px" }}>·</span>
              )}
            </span>
          ))}
        </div>

        {/* Date */}
        <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
          {today.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
        </span>
      </div>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 340px", gap: 0 }}>

        {/* Left — Today's tasks + AI brief */}
        <div style={{ overflowY: "auto", padding: "32px 40px", borderRight: "1px solid var(--border)" }}>

          {/* Section header */}
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                Today · {today.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                {totalTasks === 0 ? "No plan for today" : doneTasks === totalTasks && totalTasks > 0 ? "All done! 🎉" : `${totalTasks - doneTasks} task${totalTasks - doneTasks !== 1 ? "s" : ""} remaining`}
              </h1>
            </div>
            {totalTasks > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ height: 4, width: 120, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0}%`,
                    background: doneTasks === totalTasks ? "var(--easy)" : "var(--accent)",
                    borderRadius: 99, transition: "width 0.4s ease",
                  }} />
                </div>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                  {doneTasks}/{totalTasks}
                </span>
              </div>
            )}
          </div>

          {/* Tasks */}
          {totalTasks === 0 ? (
            <div style={{
              border: "1px solid var(--border)", borderRadius: 16,
              padding: "48px 24px", background: "var(--bg-elevated)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 24,
            }}>
              <span style={{ fontSize: 40 }}>▦</span>
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>No tasks planned for today</p>
              <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>
                Go to the Planner tab to generate your week plan
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
              {todayPlan?.items.map((item) => {
                const key = `${item.type}-${item.id}`;
                return (
                  <div key={key} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "16px 20px", borderRadius: 14,
                    border: `1.5px solid ${item.is_done ? "#bbf7d0" : "var(--border)"}`,
                    background: item.is_done ? "#f0fdf4" : "var(--bg-elevated)",
                    boxShadow: item.is_done ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
                    transition: "all 0.2s ease",
                    opacity: item.is_done ? 0.7 : 1,
                  }}>
                    <TaskCheckbox
                      done={item.is_done}
                      onCheck={() => handleTick(item)}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 15, fontWeight: item.is_done ? 400 : 600,
                        color: item.is_done ? "var(--text-muted)" : "var(--text-primary)",
                        textDecoration: item.is_done ? "line-through" : "none",
                        letterSpacing: "-0.01em", marginBottom: 4,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {item.label}
                      </p>
                      <div style={{ display: "flex", gap: 6 }}>
                        {item.topic && (
                          <span style={{
                            fontSize: 10, color: "var(--text-muted)",
                            background: "var(--bg-hover)", padding: "2px 8px",
                            borderRadius: 99, border: "1px solid var(--border)",
                          }}>{item.topic}</span>
                        )}
                        {item.type === "dsa" && item.difficulty && (
                          <span style={{
                            fontSize: 10, fontWeight: 700,
                            color: DIFF_COLOR[item.difficulty] ?? "var(--text-muted)",
                            background: `${DIFF_COLOR[item.difficulty]}15`,
                            padding: "2px 8px", borderRadius: 99,
                          }}>{item.difficulty}</span>
                        )}
                        {item.type === "subtopic" && (
                          <span style={{
                            fontSize: 10, fontWeight: 600,
                            color: "var(--accent-text)",
                            background: "var(--accent-glow)",
                            padding: "2px 8px", borderRadius: 99,
                          }}>Topic</span>
                        )}
                      </div>
                    </div>
                    {item.is_done && (
                      <span style={{ fontSize: 18 }}>✓</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* AI Brief */}
          <div style={{
            border: "1px solid var(--border)", borderRadius: 16,
            overflow: "hidden", background: "var(--bg-elevated)",
          }}>
            <div style={{
              padding: "14px 20px",
              borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "var(--bg-hover)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 6,
                  background: "linear-gradient(135deg, var(--accent), #7c3aed)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10,
                }}>✦</div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                  Today’s Brief
                </span>
              </div>

              {/* Refresh button */}
              <button
                onClick={generateBrief}
                disabled={briefLoading}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 14px", borderRadius: 9,
                  border: "1px solid var(--border)",
                  background: briefLoading ? "var(--bg-elevated)" : "var(--bg-surface)",
                  color: briefLoading ? "var(--text-muted)" : "var(--accent-text)",
                  fontSize: 11, fontWeight: 600, cursor: briefLoading ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!briefLoading) {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 2px var(--accent-glow)";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <span style={{
                  display: "inline-block",
                  animation: briefLoading ? "spin 1s linear infinite" : "none",
                  fontSize: 12,
                }}>
                  {briefLoading ? "◌" : "↺"}
                </span>
                {briefLoading ? "Generating brief…" : "Refresh Today's Intel"}
              </button>
            </div>

            <div style={{ padding: "20px 24px", minHeight: 80 }}>
              {!brief && !briefLoading && (
                <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>
                  Hit “Refresh Today’s Intel” to get your AI-powered daily briefing based on your tasks, DSA progress, and spending.
                </p>
              )}
              {briefLoading && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {[0,1,2].map((i) => (
                    <div key={i} style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: "var(--accent)",
                      animation: `bounce 1s ${i * 0.2}s ease infinite alternate`,
                    }} />
                  ))}
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Reading your data…</span>
                </div>
              )}
              {brief && !briefLoading && (
                <div style={{ fontSize: 13, lineHeight: 1.8, color: "var(--text-primary)" }}>
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p style={{ marginBottom: 10, color: "var(--text-secondary)", lineHeight: 1.75 }}>
                          {children}
                        </p>
                      ),
                      strong: ({ children }) => (
                        <strong style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                          {children}
                        </strong>
                      ),
                      ul: ({ children }) => (
                        <ul style={{ paddingLeft: 0, margin: "8px 0", listStyle: "none" }}>
                          {children}
                        </ul>
                      ),
                      li: ({ children }) => (
                        <li style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                          <div style={{
                            width: 5, height: 5, borderRadius: "50%",
                            background: "var(--accent)", marginTop: 8, flexShrink: 0,
                          }} />
                          <span style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>{children}</span>
                        </li>
                      ),
                      h1: ({ children }) => (
                        <h1 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)", marginBottom: 14, letterSpacing: "-0.02em" }}>
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10, marginTop: 14 }}>
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-text)", marginBottom: 8, marginTop: 12 }}>
                          {children}
                        </h3>
                      ),
                      hr: () => (
                        <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "14px 0" }} />
                      ),
                      code: ({ children }) => (
                        <code style={{
                          fontSize: 11, fontFamily: "monospace",
                          background: "var(--bg-hover)", color: "var(--accent-text)",
                          padding: "1px 6px", borderRadius: 5,
                        }}>
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {brief}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — Inbox + Week view */}
        <div style={{ overflowY: "auto", padding: "32px 28px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Week at a glance */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
              This Week
            </p>
            <div style={{ display: "flex", gap: 6 }}>
              {getWeekDays().map((date) => {
                const dayPlan = currentPlan?.days.find((d) => d.date === date);
                const status  = dayPlan?.status ?? "pending";
                const isToday = date === todayStr;
                const dotStyle = STATUS_DOT[status] ?? STATUS_DOT.pending;
                const dayName  = DAY_NAMES[new Date(date + "T00:00:00").getDay()];
                const dayNum   = new Date(date + "T00:00:00").getDate();
                const done     = dayPlan?.items.filter((i) => i.is_done).length ?? 0;
                const total    = dayPlan?.items.length ?? 0;

                return (
                  <div key={date} style={{
                    flex: 1, display: "flex", flexDirection: "column",
                    alignItems: "center", gap: 5,
                    padding: "10px 4px", borderRadius: 12,
                    border: `1.5px solid ${isToday ? "var(--accent)" : "var(--border)"}`,
                    background: isToday ? "var(--accent-glow)" : "var(--bg-elevated)",
                    boxShadow: isToday ? "0 0 0 2px var(--accent-glow)" : "none",
                  }}>
                    <span style={{ fontSize: 9, fontWeight: 600, color: isToday ? "var(--accent-text)" : "var(--text-muted)", letterSpacing: "0.04em" }}>
                      {dayName}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: isToday ? 800 : 500, color: isToday ? "var(--accent-text)" : "var(--text-primary)" }}>
                      {dayNum}
                    </span>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: dotStyle.bg,
                      boxShadow: dotStyle.shadow,
                    }} />
                    {total > 0 && (
                      <span style={{ fontSize: 8, color: "var(--text-muted)" }}>{done}/{total}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inbox — Gmail + Slack */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
              Inbox
            </p>
            <div style={{
              border: "1px solid var(--border)", borderRadius: 14,
              overflow: "hidden", background: "var(--bg-elevated)",
            }}>
              {/* Gmail */}
              <div style={{
                padding: "16px 18px",
                borderBottom: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: "#fef2f2",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14,
                  }}>📧</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Gmail</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Meeting signals</p>
                  </div>
                </div>
                <button style={{
                  padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                  cursor: "pointer", border: "1px solid var(--border)",
                  background: "transparent", color: "var(--accent-text)",
                  transition: "all 0.15s",
                }}>Connect</button>
              </div>

              {/* Slack */}
              <div style={{
                padding: "16px 18px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: "#f0fdf4",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14,
                  }}>💬</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Slack</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Mentions & DMs</p>
                  </div>
                </div>
                <button style={{
                  padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                  cursor: "pointer", border: "1px solid var(--border)",
                  background: "transparent", color: "var(--accent-text)",
                  transition: "all 0.15s",
                }}>Connect</button>
              </div>
            </div>

            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, textAlign: "center", lineHeight: 1.5 }}>
              Connect Gmail & Slack in Phase 4 to see meeting invites and mentions here
            </p>
          </div>

          {/* Quick stats */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
              At a Glance
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {([
                {
                  label: "DSA Progress",
                  value: `${dsaSolved} / 1000`,
                  sub: `${Math.round((dsaSolved / 1000) * 100)}% complete`,
                  color: "var(--accent-text)",
                  pct: dsaSolved / 10,
                },
                financeData ? {
                  label: "Monthly Spend",
                  value: `${financeData.currency}${Math.round(financeData.spent).toLocaleString()}`,
                  sub: `of ${financeData.currency}${financeData.stipend.toLocaleString()} stipend`,
                  color: financeData.spent > financeData.stipend ? "var(--hard)" : "var(--easy)",
                  pct: financeData.stipend > 0 ? Math.min(100, (financeData.spent / financeData.stipend) * 100) : 0,
                } : null,
                {
                  label: "Prompt Vault",
                  value: `${promptCount} prompts`,
                  sub: "saved offline",
                  color: "var(--medium)",
                  pct: null,
                },
              ] as Array<{ label: string; value: string; sub: string; color: string; pct: number | null }>)
                .filter(Boolean)
                .map((item) => (
                <div key={item.label} style={{
                  border: "1px solid var(--border)", borderRadius: 12,
                  padding: "12px 16px", background: "var(--bg-elevated)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{item.label}</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: item.color, letterSpacing: "-0.02em" }}>{item.value}</span>
                  </div>
                  {item.pct !== null && (
                    <div style={{ height: 3, background: "var(--border)", borderRadius: 99, marginBottom: 4, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${item.pct}%`,
                        background: item.color, borderRadius: 99,
                        transition: "width 0.5s ease",
                      }} />
                    </div>
                  )}
                  <p style={{ fontSize: 10, color: "var(--text-muted)" }}>{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes bounce {
          from { transform: translateY(0); opacity: 0.5; }
          to   { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}