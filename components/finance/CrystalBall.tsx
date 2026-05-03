"use client";

import { useState } from "react";
import type { ScenarioProjection, CategorySummary, FinanceData } from "@/types";

interface Props {
  currency: string;
  data: FinanceData;
  scenarios: ScenarioProjection[];
  categorySummaries: CategorySummary[];
  budgetWarnings: CategorySummary[];
  calcExpenseImpact: (amount: number) => { extraPerMonth: number; goalDelayMonths: number } | null;
}

export default function CrystalBall({
  currency, data, scenarios, categorySummaries, budgetWarnings, calcExpenseImpact,
}: Props) {
  const [impactAmt, setImpactAmt] = useState("");
  const impact = impactAmt ? calcExpenseImpact(parseFloat(impactAmt) || 0) : null;

  const today    = new Date();
  const daysInMo = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const monthPct = today.getDate() / daysInMo;

  // 1-year goal guide
  const targetMonths = data.target_date
    ? Math.max(1, Math.round((new Date(data.target_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30.44)))
    : 12;
  const neededPerMonth = data.savings_goal > 0 ? Math.ceil(data.savings_goal / targetMonths) : 0;
  const currentPace    = scenarios[0]?.monthlySavings ?? 0;
  const goalPct        = neededPerMonth > 0 ? Math.min(100, Math.max(0, (currentPace / neededPerMonth) * 100)) : 0;
  const onTrack        = currentPace >= neededPerMonth;

  const SCENARIO_META = [
    { accentColor: "#f87171", bgColor: "rgba(248,113,113,0.06)", borderColor: "rgba(248,113,113,0.15)" },
    { accentColor: "#fb923c", bgColor: "rgba(251,146,60,0.06)",  borderColor: "rgba(251,146,60,0.15)"  },
    { accentColor: "#4ade80", bgColor: "rgba(74,222,128,0.06)",  borderColor: "rgba(74,222,128,0.15)"  },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

      {/* ── 1-YEAR GUIDE ── */}
      {data.savings_goal > 0 ? (
        <div style={{
          borderRadius: 20, padding: "26px 28px",
          background: "var(--bg-elevated)", border: "1px solid rgba(255,255,255,0.07)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: onTrack
              ? "radial-gradient(ellipse 55% 60% at 95% 10%, rgba(74,222,128,0.09) 0%, transparent 70%)"
              : "radial-gradient(ellipse 55% 60% at 95% 10%, rgba(251,146,60,0.09) 0%, transparent 70%)",
          }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
                  {targetMonths <= 12 ? `${targetMonths}-month goal` : "Savings goal"}
                </p>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>
                  {currency}{data.savings_goal.toLocaleString()}
                </p>
              </div>
              <div style={{
                padding: "6px 14px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                background: onTrack ? "rgba(74,222,128,0.15)" : "rgba(251,146,60,0.15)",
                color: onTrack ? "#4ade80" : "#fb923c",
                letterSpacing: "0.05em", textTransform: "uppercase",
              }}>
                {onTrack ? "On Track" : "Behind"}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
              <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Need / month</p>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
                  {currency}{neededPerMonth.toLocaleString()}
                </p>
              </div>
              <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Saving now</p>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", color: currentPace < 0 ? "#f87171" : "#fff" }}>
                  {currentPace < 0 ? "−" : ""}{currency}{Math.abs(Math.round(currentPace)).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Savings rate vs. required</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: onTrack ? "#4ade80" : "#fb923c" }}>
                  {Math.round(goalPct)}%
                </span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${goalPct}%`,
                  background: onTrack
                    ? "linear-gradient(90deg, #16a34a, #4ade80)"
                    : "linear-gradient(90deg, #92400e, #fb923c)",
                  borderRadius: 99, transition: "width 0.7s cubic-bezier(.4,0,.2,1)",
                }} />
              </div>
              {data.target_date && (
                <p style={{ margin: "7px 0 0", fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
                  Target: {new Date(data.target_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  {" · "}{targetMonths} month{targetMonths !== 1 ? "s" : ""} away
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          borderRadius: 18, padding: "22px 24px",
          background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.2)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 700, color: "#a78bfa" }}>Set a 1-year savings goal</p>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Tell us your target and we'll guide you there</p>
          </div>
          <span style={{ fontSize: 24, color: "rgba(167,139,250,0.5)" }}>→</span>
        </div>
      )}

      {/* ── GOAL HERO ── */}
      {data.savings_goal > 0 && scenarios.length > 0 && (
        <div style={{
          borderRadius: 20, overflow: "hidden",
          background: "var(--bg-elevated)", border: "1px solid rgba(255,255,255,0.07)",
          position: "relative",
        }}>
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse 50% 60% at 10% 50%, rgba(124,58,237,0.10) 0%, transparent 70%)",
          }} />

          {/* Goal header */}
          <div style={{ padding: "28px 28px 20px", position: "relative" }}>
            <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
              Savings goal
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <p style={{ margin: 0, fontSize: 40, fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>
                {currency}{data.savings_goal.toLocaleString()}
              </p>
              {data.target_date && (
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>by {data.target_date}</span>
              )}
            </div>
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 0" }} />

          {/* Scenarios row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
            {scenarios.map((s, i) => {
              const meta = SCENARIO_META[i] ?? SCENARIO_META[0];
              return (
                <div key={s.label} style={{
                  padding: "18px 20px",
                  borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  background: meta.bgColor,
                }}>
                  <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: meta.accentColor }}>
                    {s.label}
                  </p>
                  <p style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", color: s.monthlySavings < 0 ? "#f87171" : "#fff" }}>
                    {s.monthlySavings < 0 ? "−" : ""}{currency}{Math.abs(Math.round(s.monthlySavings)).toLocaleString()}
                  </p>
                  <p style={{ margin: "0 0 10px", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{s.description}</p>
                  {s.monthsToGoal !== null ? (
                    <>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: meta.accentColor }}>{s.monthsToGoal} months</p>
                      {s.goalDate && <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{s.goalDate}</p>}
                    </>
                  ) : (
                    <p style={{ margin: 0, fontSize: 12, color: "#f87171" }}>Not reachable</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── WARNINGS ── */}
      {budgetWarnings.length > 0 && (
        <div style={{
          borderRadius: 18, padding: "18px 24px",
          background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.2)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 14, color: "#fb923c" }}>⚠</span>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fb923c" }}>Overpacing your budget</p>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>
              {Math.round(monthPct * 100)}% through month
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {budgetWarnings.map((w) => (
              <div key={w.category} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{w.category}</span>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontVariantNumeric: "tabular-nums" }}>
                    {currency}{w.spent}/{currency}{w.budgeted}
                  </span>
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: "#fb923c",
                    background: "rgba(251,146,60,0.15)", padding: "2px 10px", borderRadius: 99,
                  }}>{w.percent}% used</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SPEND VELOCITY ── */}
      {categorySummaries.length > 0 && (
        <div style={{
          borderRadius: 18, overflow: "hidden",
          background: "var(--bg-elevated)", border: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div style={{ padding: "18px 24px 14px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>Spend velocity</p>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em" }}>
              vs expected at day {today.getDate()}
            </span>
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
          <div style={{ padding: "6px 0" }}>
            {categorySummaries.map((s, i) => {
              const expected = s.budgeted * monthPct;
              const velocity = expected > 0 ? s.spent / expected : 0;
              const col      = velocity > 1.3 ? "#f87171" : velocity > 1 ? "#fb923c" : "#4ade80";
              const lbl      = velocity > 1.3 ? "Fast" : velocity > 1 ? "Ahead" : "OK";
              return (
                <div key={s.category} style={{
                  padding: "11px 24px",
                  borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{s.category}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontVariantNumeric: "tabular-nums" }}>
                        {currency}{s.spent}/{currency}{s.budgeted}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: col, letterSpacing: "0.06em",
                        background: `${col}18`, padding: "2px 8px", borderRadius: 99,
                      }}>{lbl}</span>
                    </div>
                  </div>
                  <div style={{ position: "relative", height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 99 }}>
                    <div style={{ height: "100%", width: `${Math.min(100, s.percent)}%`, background: col, borderRadius: 99, transition: "width 0.5s ease" }} />
                    <div style={{ position: "absolute", top: -3, bottom: -3, left: `${Math.min(98, monthPct * 100)}%`, width: 1.5, background: "rgba(255,255,255,0.2)", borderRadius: 99 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── IMPACT CALCULATOR ── */}
      <div style={{
        borderRadius: 18, overflow: "hidden",
        background: "var(--bg-elevated)", border: "1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{ padding: "22px 24px 18px" }}>
          <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "#fff" }}>Impact calculator</p>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>What does this purchase really cost you?</p>
        </div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
        <div style={{ padding: "18px 24px 22px" }}>
          <div style={{
            display: "flex", alignItems: "center",
            background: "rgba(255,255,255,0.04)", borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.07)",
            padding: "4px 18px",
          }}>
            <span style={{ fontSize: 22, color: "rgba(255,255,255,0.3)", userSelect: "none" }}>{currency}</span>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={impactAmt}
              onChange={(e) => setImpactAmt(e.target.value)}
              style={{
                flex: 1, padding: "12px 10px", background: "none", border: "none",
                fontSize: 28, fontWeight: 800, color: "#fff", outline: "none",
                letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums",
              }}
            />
          </div>

          {impact && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
              <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }`}</style>
              <div style={{
                padding: "16px 18px", borderRadius: 14,
                background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.18)",
                animation: "fadeUp 0.2s ease",
              }}>
                <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#f87171" }}>Goal delayed</p>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#f87171", letterSpacing: "-0.04em" }}>
                  {impact.goalDelayMonths}
                  <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(248,113,113,0.6)" }}> mo</span>
                </p>
              </div>
              <div style={{
                padding: "16px 18px", borderRadius: 14,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                animation: "fadeUp 0.2s ease",
              }}>
                <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Feels like / mo</p>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>
                  {currency}{Math.round(impact.extraPerMonth).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          {!data.savings_goal && (
            <p style={{ margin: "14px 0 0", fontSize: 12, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
              Set a savings goal in Settings to unlock this.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
