"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useAuthStore } from "@/store/authStore";
import { getDb } from "@/lib/db";
import { askGroqChat } from "@/lib/groq";
import { usePlanner } from "@/hooks/usePlanner";
import { useGmail } from "@/hooks/useGmail";
import { useCalendar } from "@/hooks/useCalendar";
import { useSettingsStore } from "@/store/settingsStore";
import TaskCheckbox from "@/components/planner/TaskCheckbox";
import type { DayPlan, DayPlanItem } from "@/types";
import type { CalendarEvent } from "@/lib/calendar";
import type { GmailMessage } from "@/lib/gmail";

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
  const { emails: gmailEmails, loading: gmailLoading, error: gmailError, refetch: refetchGmail } = useGmail();
  const { events: calEvents, loading: calLoading, noScope: calNoScope, refetch: refetchCal } = useCalendar();
  const { gmailToken } = useSettingsStore();
  const [todayPlan, setTodayPlan] = useState<DayPlan | null>(null);
  const [brief, setBrief]         = useState<string>(() => {
    try { return localStorage.getItem("ares-brief-text") ?? ""; } catch { return ""; }
  });
  const [briefLastFetch, setBriefLastFetch] = useState<number>(() => {
    try { return Number(localStorage.getItem("ares-brief-ts") ?? "0"); } catch { return 0; }
  });
  const [briefLoading, setBriefLoading] = useState(false);
  const [streak, setStreak]       = useState(0);
  const [dsaSolved, setDsaSolved] = useState(0);
  const [financeData, setFinanceData] = useState<{ spent: number; stipend: number; currency: string } | null>(null);
  const [promptCount, setPromptCount] = useState(0);
  const [tickingId, setTickingId] = useState<string | null>(null);
  const [selectedCalEvent, setSelectedCalEvent] = useState<CalendarEvent | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<GmailMessage | null>(null);

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

  const TWO_HOURS = 2 * 60 * 60 * 1000;

  useEffect(() => {
    if (!user) return;
    const stale = briefLastFetch === 0 || Date.now() - briefLastFetch >= TWO_HOURS;
    if (stale && !briefLoading) void generateBrief();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => { void generateBrief(); }, TWO_HOURS);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
      const now = Date.now();
      setBriefLastFetch(now);
      try { localStorage.setItem("ares-brief-text", response); localStorage.setItem("ares-brief-ts", String(now)); } catch {}
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
              border: "1px solid var(--border)", borderRadius: 12,
              padding: "48px 24px", background: "var(--bg-elevated)",
              boxShadow: "var(--shadow-card)",
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
                    border: `1px solid ${item.is_done ? "var(--easy-bg)" : "var(--border)"}`,
                    background: item.is_done ? "var(--easy-bg)" : "var(--bg-elevated)",
                    boxShadow: item.is_done ? "none" : "var(--shadow-card)",
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
            border: "1px solid var(--border)", borderRadius: 12,
            overflow: "hidden", background: "var(--bg-elevated)",
            boxShadow: "var(--shadow-card)",
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

        {/* Right — Calendar + Inbox + Stats */}
        <div style={{ overflowY: "auto", padding: "32px 28px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Week strip */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>This Week</p>
            <div style={{ display: "flex", gap: 6 }}>
              {getWeekDays().map((date) => {
                const dayPlan  = currentPlan?.days.find((d) => d.date === date);
                const status   = dayPlan?.status ?? "pending";
                const isToday  = date === todayStr;
                const dotStyle = STATUS_DOT[status] ?? STATUS_DOT.pending;
                const dayName  = DAY_NAMES[new Date(date + "T00:00:00").getDay()];
                const dayNum   = new Date(date + "T00:00:00").getDate();
                const done     = dayPlan?.items.filter((i) => i.is_done).length ?? 0;
                const total    = dayPlan?.items.length ?? 0;
                return (
                  <div key={date} style={{
                    flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                    padding: "10px 4px", borderRadius: 12,
                    border: `1px solid ${isToday ? "var(--accent)" : "var(--border)"}`,
                    background: isToday ? "var(--accent-glow)" : "var(--bg-elevated)",
                    boxShadow: "var(--shadow-card)",
                  }}>
                    <span style={{ fontSize: 9, fontWeight: 600, color: isToday ? "var(--accent-text)" : "var(--text-muted)", letterSpacing: "0.04em" }}>{dayName}</span>
                    <span style={{ fontSize: 13, fontWeight: isToday ? 800 : 500, color: isToday ? "var(--accent-text)" : "var(--text-primary)" }}>{dayNum}</span>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: dotStyle.bg, boxShadow: dotStyle.shadow }} />
                    {total > 0 && <span style={{ fontSize: 8, color: "var(--text-muted)" }}>{done}/{total}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Google Calendar */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Calendar</p>
              {gmailToken && !calNoScope && (
                <button onClick={() => void refetchCal()} style={{ fontSize: 10, color: "var(--accent-text)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>↺</button>
              )}
            </div>

            {!gmailToken ? (
              <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>📅 Connect Gmail for calendar</span>
                <a href="/settings" style={{ fontSize: 11, fontWeight: 600, color: "var(--accent-text)", textDecoration: "none" }}>Connect →</a>
              </div>
            ) : calNoScope ? (
              <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", background: "var(--bg-elevated)" }}>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Calendar access not granted.</p>
                <a href="/settings" style={{ fontSize: 11, fontWeight: 600, color: "var(--accent-text)", textDecoration: "none" }}>Reconnect Gmail with calendar scope →</a>
              </div>
            ) : calLoading ? (
              <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", background: "var(--bg-elevated)", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", border: "2px solid var(--border)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Loading calendar…</span>
              </div>
            ) : calEvents.length === 0 ? (
              <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", background: "var(--bg-elevated)", textAlign: "center" }}>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>No events in the next 7 days</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {calEvents.slice(0, 6).map((ev) => {
                  const startDate = new Date(ev.start);
                  const isToday2  = startDate.toDateString() === new Date().toDateString();
                  const timeLabel = ev.isAllDay ? "All day" : startDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
                  const dayLabel  = isToday2 ? "Today" : startDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
                  const borderCol = ev.isNow ? "var(--hard)" : ev.isSoon ? "var(--medium)" : ev.meetingLinks.length > 0 ? "var(--accent)" : "var(--border)";
                  const bgCol     = ev.isNow ? "var(--hard-bg)" : ev.isSoon ? "var(--medium-bg)" : ev.meetingLinks.length > 0 ? "var(--accent-glow)" : "var(--bg-elevated)";
                  return (
                    <div key={ev.id} onClick={() => setSelectedCalEvent(ev)} style={{ border: `1px solid ${borderCol}`, borderRadius: 11, padding: "10px 13px", background: bgCol, boxShadow: "var(--shadow-card)", cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                          {ev.isNow && <span style={{ fontSize: 9, fontWeight: 700, color: "var(--hard)", background: "var(--hard-bg)", padding: "1px 5px", borderRadius: 4, marginRight: 6 }}>LIVE</span>}
                          {ev.isSoon && <span style={{ fontSize: 9, fontWeight: 700, color: "var(--medium)", background: "var(--medium-bg)", padding: "1px 5px", borderRadius: 4, marginRight: 6 }}>SOON</span>}
                          {ev.summary}
                        </p>
                        {ev.meetingLinks.length > 0 && (
                          <button onClick={async (e) => { e.stopPropagation(); const { open } = await import("@tauri-apps/plugin-shell"); await open(ev.meetingLinks[0]); }} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "var(--accent)", color: "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer", flexShrink: 0, boxShadow: "0 0 8px var(--accent-glow)" }}>
                            Join
                          </button>
                        )}
                      </div>
                      <p style={{ fontSize: 10, color: "var(--text-muted)" }}>
                        {dayLabel} · {timeLabel}
                        {ev.attendeeCount > 1 && ` · ${ev.attendeeCount} people`}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Inbox */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Inbox</p>
              {gmailToken && (
                <button onClick={() => void refetchGmail()} style={{ fontSize: 10, color: "var(--accent-text)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>↺</button>
              )}
            </div>

            {!gmailToken ? (
              <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>📧 Connect Gmail to see inbox</span>
                <a href="/settings" style={{ fontSize: 11, fontWeight: 600, color: "var(--accent-text)", textDecoration: "none" }}>Connect →</a>
              </div>
            ) : gmailLoading ? (
              <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", background: "var(--bg-elevated)", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", border: "2px solid var(--border)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Loading inbox…</span>
              </div>
            ) : gmailError ? (
              <div style={{ border: "1px solid var(--hard)", borderRadius: 12, padding: "16px 18px", background: "var(--hard-bg)", textAlign: "center" }}>
                <p style={{ fontSize: 12, color: "var(--hard)" }}>{gmailError}</p>
              </div>
            ) : gmailEmails.length === 0 ? (
              <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", background: "var(--bg-elevated)", textAlign: "center" }}>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Inbox is clear</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {gmailEmails.slice(0, 8).map((email) => (
                  <div key={email.id} onClick={() => setSelectedEmail(email)} style={{
                    border: `1px solid ${email.meetingLinks.length > 0 ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: 11, padding: "10px 13px",
                    background: email.meetingLinks.length > 0 ? "var(--accent-glow)" : "var(--bg-elevated)",
                    boxShadow: "var(--shadow-card)", cursor: "pointer",
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 2 }}>
                      {!email.isRead && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)", flexShrink: 0, marginTop: 5 }} />}
                      <p style={{ fontSize: 12, fontWeight: email.isRead ? 400 : 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                        {email.subject}
                      </p>
                    </div>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: email.snippet ? 4 : 0, paddingLeft: !email.isRead ? 13 : 0 }}>
                      {email.from} · {new Date(email.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {email.snippet && (
                      <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4, paddingLeft: !email.isRead ? 13 : 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {email.snippet}
                      </p>
                    )}
                    {email.meetingLinks.length > 0 && (
                      <div style={{ display: "flex", gap: 6, marginTop: 6, paddingLeft: !email.isRead ? 13 : 0 }}>
                        {email.meetingLinks.map((link, i) => (
                          <button key={i} onClick={async (e) => { e.stopPropagation(); const { open } = await import("@tauri-apps/plugin-shell"); await open(link); }} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "var(--accent)", color: "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer", boxShadow: "0 0 8px var(--accent-glow)" }}>
                            🔗 Join
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* At a glance */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>At a Glance</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {([
                { label: "DSA Progress", value: `${dsaSolved} / 1000`, sub: `${Math.round((dsaSolved / 1000) * 100)}% complete`, color: "var(--accent-text)", pct: dsaSolved / 10 },
                financeData ? { label: "Monthly Spend", value: `${financeData.currency}${Math.round(financeData.spent).toLocaleString()}`, sub: `of ${financeData.currency}${financeData.stipend.toLocaleString()} stipend`, color: financeData.spent > financeData.stipend ? "var(--hard)" : "var(--easy)", pct: financeData.stipend > 0 ? Math.min(100, (financeData.spent / financeData.stipend) * 100) : 0 } : null,
                { label: "Prompt Vault", value: `${promptCount} prompts`, sub: "saved offline", color: "var(--medium)", pct: null },
              ] as Array<{ label: string; value: string; sub: string; color: string; pct: number | null }>)
                .filter(Boolean).map((item) => (
                <div key={item.label} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "13px 16px", background: "var(--bg-elevated)", boxShadow: "var(--shadow-card)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: item.pct !== null ? 6 : 0 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{item.label}</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: item.color, letterSpacing: "-0.02em" }}>{item.value}</span>
                  </div>
                  {item.pct !== null && (
                    <div style={{ height: 3, background: "var(--border)", borderRadius: 99, marginBottom: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${item.pct}%`, background: item.color, borderRadius: 99, transition: "width 0.5s ease" }} />
                    </div>
                  )}
                  <p style={{ fontSize: 10, color: "var(--text-muted)" }}>{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar event detail modal */}
      {selectedCalEvent && (
        <div onClick={() => setSelectedCalEvent(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 26px", width: "100%", maxWidth: 480, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                {selectedCalEvent.isNow && <span style={{ fontSize: 9, fontWeight: 700, color: "var(--hard)", background: "var(--hard-bg)", padding: "2px 6px", borderRadius: 4, marginRight: 6 }}>LIVE</span>}
                {selectedCalEvent.isSoon && <span style={{ fontSize: 9, fontWeight: 700, color: "var(--medium)", background: "var(--medium-bg)", padding: "2px 6px", borderRadius: 4, marginRight: 6 }}>SOON</span>}
                <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginTop: 4, lineHeight: 1.3 }}>{selectedCalEvent.summary}</p>
              </div>
              <button onClick={() => setSelectedCalEvent(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 18, cursor: "pointer", lineHeight: 1, flexShrink: 0 }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", width: 72, flexShrink: 0 }}>WHEN</span>
                <span style={{ fontSize: 12, color: "var(--text-primary)" }}>
                  {selectedCalEvent.isAllDay
                    ? new Date(selectedCalEvent.start + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }) + " · All day"
                    : (() => {
                        const s = new Date(selectedCalEvent.start);
                        const e = new Date(selectedCalEvent.end);
                        return `${s.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} · ${s.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} – ${e.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
                      })()
                  }
                </span>
              </div>
              {selectedCalEvent.attendeeCount > 0 && (
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", width: 72, flexShrink: 0 }}>PEOPLE</span>
                  <span style={{ fontSize: 12, color: "var(--text-primary)" }}>{selectedCalEvent.attendeeCount} attendee{selectedCalEvent.attendeeCount > 1 ? "s" : ""}</span>
                </div>
              )}
              {selectedCalEvent.location && (
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", width: 72, flexShrink: 0 }}>LOCATION</span>
                  <span style={{ fontSize: 12, color: "var(--text-primary)", wordBreak: "break-word" }}>{selectedCalEvent.location}</span>
                </div>
              )}
              {selectedCalEvent.description && (
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", width: 72, flexShrink: 0 }}>NOTES</span>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
                    {selectedCalEvent.description.replace(/<[^>]+>/g, "").trim()}
                  </span>
                </div>
              )}
            </div>
            {selectedCalEvent.meetingLinks.length > 0 && (() => {
              const deduped = [...new Set(selectedCalEvent.meetingLinks.map((l) => {
                try { const u = new URL(l); return u.origin + u.pathname; } catch { return l; }
              }))];
              return (
                <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
                  {deduped.map((link, i) => (
                    <button key={i} onClick={async () => { const { open } = await import("@tauri-apps/plugin-shell"); await open(link); }} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 0 12px var(--accent-glow)" }}>
                      Join Meeting
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Email detail modal */}
      {selectedEmail && (
        <div onClick={() => setSelectedEmail(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 26px", width: "100%", maxWidth: 520, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                {!selectedEmail.isRead && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block", marginRight: 8, verticalAlign: "middle" }} />}
                <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", display: "inline", lineHeight: 1.3 }}>{selectedEmail.subject}</p>
              </div>
              <button onClick={() => setSelectedEmail(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 18, cursor: "pointer", lineHeight: 1, flexShrink: 0 }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", width: 48, flexShrink: 0 }}>FROM</span>
                <span style={{ fontSize: 12, color: "var(--text-primary)", wordBreak: "break-word" }}>{selectedEmail.from}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", width: 48, flexShrink: 0 }}>DATE</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(selectedEmail.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {(selectedEmail.body || selectedEmail.snippet || "No preview available.").replace(/<[^>]+>/g, "").trim()}
              </p>
            </div>
            {selectedEmail.meetingLinks.length > 0 && (
              <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                {selectedEmail.meetingLinks.map((link, i) => (
                  <button key={i} onClick={async () => { const { open } = await import("@tauri-apps/plugin-shell"); await open(link); }} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 0 12px var(--accent-glow)" }}>
                    🔗 Join Meeting
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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