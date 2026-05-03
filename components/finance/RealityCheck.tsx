"use client";

import { useState } from "react";
import { CATEGORY_COLORS } from "@/hooks/useFinance";
import type { CategorySummary, Transaction, TransactionFormData } from "@/types";
import QuickAddModal from "./QuickAddModal";

interface Props {
  currency: string;
  dailyBudget: number;
  todayAllowance: number;
  remainingToday: number;
  spentToday: number;
  rollover: number;
  totalSpentThisMonth: number;
  projectedMonthSpend: number;
  projectedMonthlySavings: number;
  daysInMonth: number;
  dayOfMonth: number;
  daysRemaining: number;
  monthlyFreeCash: number;
  categorySummaries: CategorySummary[];
  transactions: Transaction[];
  onAdd: (form: TransactionFormData) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function RealityCheck({
  currency, dailyBudget, todayAllowance, remainingToday, spentToday,
  rollover, totalSpentThisMonth, projectedMonthSpend, projectedMonthlySavings,
  daysInMonth, dayOfMonth, daysRemaining,
  categorySummaries, transactions, onAdd, onDelete,
}: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const pctDay    = dayOfMonth / daysInMonth;
  const usedPct   = Math.max(0, Math.min(100, ((todayAllowance - remainingToday) / Math.max(1, todayAllowance)) * 100));
  const isOver    = remainingToday < 0;
  const isLow     = !isOver && remainingToday < dailyBudget * 0.25;
  const statusColor = isOver ? "#f87171" : isLow ? "#fb923c" : "#4ade80";
  const statusLabel = isOver ? "OVER LIMIT" : isLow ? "RUNNING LOW" : "ON TRACK";

  const todayStr      = new Date().toISOString().split("T")[0];
  const yesterdayStr  = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const dateGroups = transactions.reduce<Record<string, typeof transactions>>((acc, t) => {
    (acc[t.date] ??= []).push(t);
    return acc;
  }, {});
  const sortedDates = Object.keys(dateGroups).sort((a, b) => b.localeCompare(a));

  function dateLabel(d: string) {
    if (d === todayStr) return "Today";
    if (d === yesterdayStr) return "Yesterday";
    return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try { await onDelete(id); } finally { setDeletingId(null); }
  }

  return (
    <>
      {showAdd && <QuickAddModal currency={currency} onAdd={onAdd} onClose={() => setShowAdd(false)} />}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

        {/* ── HERO ── */}
        <div style={{
          borderRadius: 20, overflow: "hidden", position: "relative",
          background: "var(--bg-elevated)", border: "1px solid rgba(255,255,255,0.07)",
          padding: "32px 32px 28px",
        }}>
          {/* ambient glow */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: `radial-gradient(ellipse 60% 50% at 85% 50%, ${statusColor}12 0%, transparent 70%)`,
          }} />

          <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              {/* Status pill */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor, display: "block", boxShadow: `0 0 8px ${statusColor}` }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: statusColor }}>{statusLabel}</span>
              </div>

              <p style={{ margin: "0 0 6px", fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 400, letterSpacing: "0.02em" }}>
                Today's allowance
              </p>

              {/* BIG number */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 10 }}>
                <span style={{
                  fontSize: 72, fontWeight: 800, lineHeight: 0.9, letterSpacing: "-0.05em",
                  color: statusColor, fontVariantNumeric: "tabular-nums",
                  textShadow: `0 0 40px ${statusColor}44`,
                }}>
                  {currency}{Math.abs(Math.round(remainingToday)).toLocaleString()}
                </span>
                <span style={{ fontSize: 18, color: "rgba(255,255,255,0.4)", marginBottom: 6, fontWeight: 300 }}>
                  {isOver ? "over" : "left"}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                  Spent {currency}{Math.round(spentToday)} of {currency}{Math.round(todayAllowance)}
                </span>
                {rollover > 0 && (
                  <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 500 }}>
                    +{currency}{Math.round(rollover)} rollover
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowAdd(true)}
              style={{
                padding: "11px 22px", borderRadius: 12, fontSize: 13, fontWeight: 700,
                background: statusColor, color: isOver ? "#1a0000" : "#001a00",
                border: "none", cursor: "pointer", flexShrink: 0,
                boxShadow: `0 4px 20px ${statusColor}55`,
                letterSpacing: "-0.01em",
              }}
            >+ Log</button>
          </div>

          {/* Progress track */}
          <div style={{ marginTop: 24, position: "relative" }}>
            <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${usedPct}%`,
                background: `linear-gradient(90deg, ${statusColor}66, ${statusColor})`,
                borderRadius: 99, transition: "width 0.7s cubic-bezier(.4,0,.2,1)",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{currency}{Math.round(dailyBudget)}/day</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>Day {dayOfMonth} · {daysRemaining}d left</span>
            </div>
          </div>
        </div>

        {/* ── MONTH STATS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {/* Spent */}
          <div style={{
            padding: "22px 24px", borderRadius: 18,
            background: "var(--bg-elevated)", border: "1px solid rgba(255,255,255,0.07)",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", bottom: -20, right: -20,
              width: 80, height: 80, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(10,132,255,0.12) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />
            <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
              Spent this month
            </p>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>
              {currency}{Math.round(totalSpentThisMonth).toLocaleString()}
            </p>
            <div style={{ marginTop: 14, height: 2, background: "rgba(255,255,255,0.07)", borderRadius: 99 }}>
              <div style={{ height: "100%", width: `${Math.min(100, pctDay * 100)}%`, background: "#0a84ff", borderRadius: 99 }} />
            </div>
            <p style={{ margin: "7px 0 0", fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
              Day {dayOfMonth} of {daysInMonth}
            </p>
          </div>

          {/* Projected savings */}
          <div style={{
            padding: "22px 24px", borderRadius: 18,
            background: projectedMonthlySavings < 0 ? "rgba(248,113,113,0.08)" : "rgba(74,222,128,0.06)",
            border: `1px solid ${projectedMonthlySavings < 0 ? "rgba(248,113,113,0.15)" : "rgba(74,222,128,0.12)"}`,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", bottom: -20, right: -20,
              width: 80, height: 80, borderRadius: "50%",
              background: `radial-gradient(circle, ${projectedMonthlySavings < 0 ? "rgba(248,113,113,0.12)" : "rgba(74,222,128,0.10)"} 0%, transparent 70%)`,
              pointerEvents: "none",
            }} />
            <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
              Projected savings
            </p>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums", color: projectedMonthlySavings < 0 ? "#f87171" : "#4ade80" }}>
              {projectedMonthlySavings < 0 ? "−" : ""}{currency}{Math.abs(Math.round(projectedMonthlySavings)).toLocaleString()}
            </p>
            <p style={{ margin: "21px 0 0", fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
              Proj. spend: {currency}{Math.round(projectedMonthSpend).toLocaleString()}
            </p>
          </div>
        </div>

        {/* ── BUDGET ── */}
        {categorySummaries.length > 0 && (
          <div style={{
            borderRadius: 18, overflow: "hidden",
            background: "var(--bg-elevated)", border: "1px solid rgba(255,255,255,0.07)",
          }}>
            <div style={{ padding: "18px 24px 14px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>Budget</p>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase" }}>This month</span>
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
            <div style={{ padding: "8px 0" }}>
              {categorySummaries.map((s, i) => {
                const col  = CATEGORY_COLORS[s.category];
                const pct  = Math.min(100, s.percent);
                const over = s.spent > s.budgeted;
                return (
                  <div key={s.category} style={{
                    padding: "11px 24px",
                    borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: col, display: "block", boxShadow: over ? `0 0 6px ${col}` : "none" }} />
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 400 }}>{s.category}</span>
                      </div>
                      <span style={{ fontSize: 12, color: over ? "#f87171" : "rgba(255,255,255,0.35)", fontVariantNumeric: "tabular-nums" }}>
                        {currency}{s.spent.toLocaleString()} <span style={{ opacity: 0.5 }}>/ {currency}{s.budgeted.toLocaleString()}</span>
                      </span>
                    </div>
                    <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${pct}%`,
                        background: over ? `linear-gradient(90deg, #dc2626, #f87171)` : col,
                        borderRadius: 99, transition: "width 0.6s ease",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TRANSACTIONS THIS MONTH ── */}
        <div style={{
          borderRadius: 18, overflow: "hidden",
          background: "var(--bg-elevated)", border: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div style={{ padding: "18px 24px 14px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>Transactions</p>
            {transactions.length > 0 && (
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.04em" }}>
                {transactions.length} this month
              </span>
            )}
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

          {transactions.length === 0 ? (
            <div style={{ padding: "20px 24px" }}>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.25)" }}>
                Nothing logged yet.{" "}
                <span onClick={() => setShowAdd(true)} style={{ color: "#0a84ff", cursor: "pointer", fontWeight: 500 }}>
                  + Log first expense
                </span>
              </p>
            </div>
          ) : (
            <div>
              {sortedDates.map((date) => {
                const group = dateGroups[date];
                const groupTotal = group.reduce((s, t) => s + t.amount, 0);
                return (
                  <div key={date}>
                    {/* Date header */}
                    <div style={{
                      padding: "8px 24px 6px",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: "rgba(255,255,255,0.025)",
                      borderTop: "1px solid rgba(255,255,255,0.04)",
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em" }}>
                        {dateLabel(date)}
                      </span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontVariantNumeric: "tabular-nums" }}>
                        {currency}{groupTotal.toLocaleString()}
                      </span>
                    </div>
                    {group.map((t, i) => {
                      const col = CATEGORY_COLORS[t.category as keyof typeof CATEGORY_COLORS];
                      return (
                        <div key={t.id} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "12px 24px",
                          borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                              background: `${col}18`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              <span style={{ width: 7, height: 7, borderRadius: "50%", background: col, display: "block" }} />
                            </div>
                            <div>
                              <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>
                                {t.note || t.category}
                              </p>
                              <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{t.category}</p>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
                              {currency}{t.amount.toLocaleString()}
                            </span>
                            <button
                              onClick={() => handleDelete(t.id)}
                              disabled={deletingId === t.id}
                              title="Delete expense"
                              style={{
                                background: "none", border: "none", cursor: "pointer",
                                color: "rgba(255,255,255,0.2)", fontSize: 18, lineHeight: 1,
                                opacity: deletingId === t.id ? 0.3 : 1, padding: 0,
                                transition: "color 0.1s",
                              }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#f87171"; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.2)"; }}
                            >×</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
