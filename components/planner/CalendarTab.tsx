"use client";

import { useState, useEffect } from "react";
import { getDb } from "@/lib/db";
import { useAuthStore } from "@/store/authStore";
import type { WeekPlan, DayPlanItem } from "@/types/planner";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const STATUS_COLOR: Record<string, string> = {
  green:   "var(--easy)",
  amber:   "var(--medium)",
  red:     "var(--hard)",
  pending: "var(--border)",
  rest:    "var(--text-faint)",
};

const STATUS_EMOJI: Record<string, string> = {
  green: "✓", amber: "~", red: "✗", pending: "", rest: "🌿",
};

interface DayData {
  date: string;
  status: string;
  items: DayPlanItem[];
  totalTasks: number;
  doneTasks: number;
}

export default function CalendarTab({ plan }: { plan: WeekPlan | null }) {
  const { user } = useAuthStore();
  const today = new Date();

  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [dayMap,    setDayMap]    = useState<Record<string, DayData>>({});
  const [loading,   setLoading]   = useState(false);
  const [selected,  setSelected]  = useState<DayData | null>(null);

  useEffect(() => {
    loadMonthData(viewYear, viewMonth);
  }, [viewYear, viewMonth, user]);

  // Also merge current week plan into map
  useEffect(() => {
    if (!plan) return;
    const merged: Record<string, DayData> = { ...dayMap };
    plan.days.forEach((d) => {
      merged[d.date] = {
        date: d.date,
        status: d.status,
        items: d.items,
        totalTasks: d.items.length,
        doneTasks: d.items.filter((i) => i.is_done).length,
      };
    });
    setDayMap(merged);
  }, [plan]);

  async function loadMonthData(year: number, month: number) {
    if (!user) return;
    setLoading(true);
    try {
      const db = await getDb();
      const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;

      // Calculate date range for overlapping weeks
      const startMonth = month === 0 ? 11 : month - 1;
      const startYear = month === 0 ? year - 1 : year;
      const endMonth = month === 11 ? 0 : month + 1;
      const endYear = month === 11 ? year + 1 : year;

      const startDate = `${startYear}-${String(startMonth + 1).padStart(2, "0")}-25`;
      const endDate = `${endYear}-${String(endMonth + 1).padStart(2, "0")}-07`;

      // Load all week plans that overlap this month
      const plans = await db.select<{ plan_json: string }[]>(
        `SELECT plan_json FROM planner_week_plans
         WHERE user_id = ?
         AND (
           week_start LIKE ? OR
           week_start BETWEEN ? AND ?
         )`,
        [
          user.id,
          `${monthStr}%`,
          startDate,
          endDate,
        ]
      );

      const merged: Record<string, DayData> = {};
      plans.forEach(({ plan_json }) => {
        try {
          const weekPlan = JSON.parse(plan_json) as WeekPlan;
          weekPlan.days.forEach((d) => {
            if (d.date.startsWith(monthStr)) {
              merged[d.date] = {
                date: d.date,
                status: d.status,
                items: d.items,
                totalTasks: d.items.length,
                doneTasks: d.items.filter((i) => i.is_done).length,
              };
            }
          });
        } catch {}
      });

      setDayMap(merged);
    } finally {
      setLoading(false);
    }
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
    setSelected(null);
  }

  function nextMonth() {
    const now = new Date();
    if (viewYear > now.getFullYear() || (viewYear === now.getFullYear() && viewMonth >= now.getMonth())) return;
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
    setSelected(null);
  }

  function goToToday() {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelected(null);
  }

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  const isFutureMonth  = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  // Build calendar grid
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const offset      = firstDay === 0 ? 6 : firstDay - 1;

  const cells: (null | { date: string; day: number })[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(viewYear, viewMonth, i + 1);
      return { date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`, day: i + 1 };
    }),
  ];

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Month stats
  const monthDays   = Object.values(dayMap).filter((d) => d.date.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`));
  const greenCount  = monthDays.filter((d) => d.status === "green").length;
  const amberCount  = monthDays.filter((d) => d.status === "amber").length;
  const redCount    = monthDays.filter((d) => d.status === "red").length;
  const totalPlanned = monthDays.filter((d) => d.status !== "rest" && d.totalTasks > 0).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Navigation */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        border: "1px solid var(--border)", borderRadius: 14,
        padding: "14px 20px", background: "var(--bg-elevated)",
      }}>
        <button onClick={prevMonth} style={{
          width: 36, height: 36, borderRadius: 9, border: "1px solid var(--border)",
          background: "transparent", color: "var(--text-secondary)",
          cursor: "pointer", fontSize: 16, display: "flex",
          alignItems: "center", justifyContent: "center",
          transition: "all 0.15s",
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
        >←</button>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h2>
          {!isCurrentMonth && (
            <button onClick={goToToday} style={{
              fontSize: 11, fontWeight: 600, color: "var(--accent-text)",
              background: "var(--accent-glow)", padding: "4px 12px",
              borderRadius: 99, border: "none", cursor: "pointer",
              transition: "all 0.15s",
            }}>Today</button>
          )}
          {loading && (
            <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid var(--border)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
          )}
        </div>

        <button onClick={nextMonth} disabled={isFutureMonth} style={{
          width: 36, height: 36, borderRadius: 9, border: "1px solid var(--border)",
          background: "transparent",
          color: isFutureMonth ? "var(--text-faint)" : "var(--text-secondary)",
          cursor: isFutureMonth ? "not-allowed" : "pointer",
          fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
          opacity: isFutureMonth ? 0.4 : 1, transition: "all 0.15s",
        }}
          onMouseEnter={(e) => { if (!isFutureMonth) { (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; } }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = isFutureMonth ? "var(--text-faint)" : "var(--text-secondary)"; }}
        >→</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, alignItems: "start" }}>

        {/* Calendar grid */}
        <div style={{ border: "1px solid var(--border)", borderRadius: 16, padding: "20px", background: "var(--bg-elevated)" }}>

          {/* Week day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
            {weekDays.map((d) => (
              <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.05em", padding: "4px 0" }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {cells.map((cell, i) => {
              if (!cell) return <div key={`e${i}`} />;

              const isToday   = cell.date === todayStr;
              const isPast    = cell.date < todayStr;
              const isFuture  = cell.date > todayStr;
              const data      = dayMap[cell.date];
              const status    = data?.status;
              const isSelected = selected?.date === cell.date;

              const bg = isSelected
                ? "var(--accent)"
                : status === "green" ? "var(--easy-bg)"
                : status === "amber" ? "var(--medium-bg)"
                : status === "red"   ? "var(--hard-bg)"
                : "transparent";

              const borderColor = isSelected
                ? "var(--accent)"
                : isToday ? "var(--accent)"
                : status  ? `${STATUS_COLOR[status]}50`
                : "var(--border)";

              return (
                <div
                  key={cell.date}
                  onClick={() => data ? setSelected(isSelected ? null : data) : null}
                  style={{
                    aspectRatio: "1", borderRadius: 10,
                    border: `1px solid ${borderColor}`,
                    background: bg,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 2,
                    cursor: data ? "pointer" : "default",
                    opacity: isFuture && !data ? 0.3 : 1,
                    boxShadow: isToday && !isSelected ? "0 0 0 2px var(--accent-glow)" : "none",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (data && !isSelected) (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = borderColor;
                  }}
                >
                  <span style={{
                    fontSize: 13, fontWeight: isToday || isSelected ? 800 : 500,
                    color: isSelected ? "#fff" : isToday ? "var(--accent-text)" : "var(--text-secondary)",
                  }}>
                    {cell.day}
                  </span>
                  {status && STATUS_EMOJI[status] && (
                    <span style={{
                      fontSize: 8, fontWeight: 700,
                      color: isSelected ? "#fff" : STATUS_COLOR[status],
                    }}>
                      {STATUS_EMOJI[status]}
                    </span>
                  )}
                  {data && data.totalTasks > 0 && (
                    <div style={{ display: "flex", gap: 1, marginTop: 1 }}>
                      {Array.from({ length: Math.min(data.totalTasks, 4) }, (_, i) => (
                        <div key={i} style={{
                          width: 3, height: 3, borderRadius: "50%",
                          background: i < data.doneTasks
                            ? (isSelected ? "#fff" : STATUS_COLOR[status] ?? "var(--border)")
                            : (isSelected ? "rgba(255,255,255,0.3)" : "var(--border)"),
                        }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Month stats */}
          <div style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "16px 18px", background: "var(--bg-elevated)" }}>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>
              {MONTH_NAMES[viewMonth]} Stats
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Complete days",  value: greenCount, color: "var(--easy)",   emoji: "✓" },
                { label: "Partial days",   value: amberCount, color: "var(--medium)", emoji: "~" },
                { label: "Missed days",    value: redCount,   color: "var(--hard)",   emoji: "✗" },
                { label: "Total planned",  value: totalPlanned, color: "var(--accent-text)", emoji: "▦" },
              ].map(({ label, value, color, emoji }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 10, color, fontWeight: 700 }}>{emoji}</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 800, color, letterSpacing: "-0.02em" }}>{value}</span>
                </div>
              ))}
            </div>

            {totalPlanned > 0 && (
              <>
                <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Success rate</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-text)" }}>
                      {Math.round((greenCount / totalPlanned) * 100)}%
                    </span>
                  </div>
                  <div style={{ height: 4, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.round((greenCount / totalPlanned) * 100)}%`,
                      background: "linear-gradient(90deg, var(--accent), var(--easy))",
                      borderRadius: 99, transition: "width 0.5s ease",
                    }} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Selected day detail */}
          {selected ? (
            <div style={{ border: "1px solid var(--accent)40", borderRadius: 14, padding: "16px 18px", background: "var(--accent-glow)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                  {new Date(selected.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
                </h3>
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  color: STATUS_COLOR[selected.status],
                  background: `${STATUS_COLOR[selected.status]}20`,
                  padding: "2px 8px", borderRadius: 99,
                }}>
                  {selected.status.toUpperCase()}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {selected.items.length === 0 ? (
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>No tasks for this day</p>
                ) : (
                  selected.items.map((item, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "6px 10px", borderRadius: 8,
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                    }}>
                      <div style={{
                        width: 14, height: 14, borderRadius: 4, flexShrink: 0,
                        border: `1.5px solid ${item.is_done ? "var(--easy)" : "var(--border-subtle)"}`,
                        background: item.is_done ? "var(--easy)" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {item.is_done && (
                          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                            <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span style={{
                        fontSize: 11, flex: 1,
                        color: item.is_done ? "var(--text-muted)" : "var(--text-primary)",
                        textDecoration: item.is_done ? "line-through" : "none",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {item.label}
                      </span>
                      {item.difficulty && (
                        <span style={{
                          fontSize: 9, fontWeight: 700,
                          color: item.difficulty === "Easy" ? "var(--easy)" : item.difficulty === "Medium" ? "var(--medium)" : "var(--hard)",
                        }}>
                          {item.difficulty[0]}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>

              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10, textAlign: "right" }}>
                {selected.doneTasks}/{selected.totalTasks} completed
              </p>
            </div>
          ) : (
            <div style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "20px 18px", background: "var(--bg-elevated)", textAlign: "center" }}>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Click any planned day to see task details
              </p>
            </div>
          )}

          {/* Legend */}
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px", background: "var(--bg-elevated)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { emoji: "✓", label: "All tasks done",     color: "var(--easy)"   },
                { emoji: "~", label: "Most tasks done",    color: "var(--medium)" },
                { emoji: "✗", label: "Few tasks done",     color: "var(--hard)"   },
                { emoji: "•", label: "Dots = task count",  color: "var(--text-muted)" },
              ].map(({ emoji, label, color }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, color, fontWeight: 700, width: 12 }}>{emoji}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
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
      `}</style>
    </div>
  );
}
