"use client";

import type { FinanceData, SavingsProjection, CategorySummary } from "@/types";

interface Props {
  data: FinanceData;
  projection: SavingsProjection | null;
  summaries: CategorySummary[];
  onTabChange: (t: "transactions") => void;
}

export default function OverviewTab({ data, projection, summaries, onTabChange }: Props) {
  const cur = data.currency ?? "₹";
  const totalBudget = (["rent","food","transport","subscriptions","misc"] as (keyof FinanceData)[])
    .reduce((s, k) => s + (Number(data[k]) || 0), 0);
  const totalSpent = summaries.reduce((s, c) => s + c.spent, 0);
  const totalSaved = data.stipend - totalSpent;
  const spentPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const fmt = (n: number) => {
    const abs = Math.abs(n);
    const val = abs >= 100000 ? `${(abs / 100000).toFixed(1)}L`
      : abs >= 1000 ? `${(abs / 1000).toFixed(1)}K` : abs.toFixed(0);
    return `${n < 0 ? "-" : ""}${cur}${val}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { label: "Stipend", value: fmt(data.stipend), color: "var(--accent-text)", sub: "this month" },
          { label: "Spent",   value: fmt(totalSpent),   color: totalSpent > totalBudget ? "var(--hard)" : "var(--medium)", sub: `of ${fmt(totalBudget)} budget` },
          { label: "Saved",   value: fmt(totalSaved),   color: totalSaved >= 0 ? "var(--easy)" : "var(--hard)", sub: totalSaved >= 0 ? "on track" : "over budget" },
        ].map(({ label, value, color, sub }) => (
          <div key={label} style={{
            border: "1px solid var(--border)", borderRadius: 14,
            padding: "18px 20px", background: "var(--bg-elevated)",
          }}>
            <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
            <p style={{ fontSize: 26, fontWeight: 800, color, letterSpacing: "-0.03em", marginBottom: 4 }}>{value}</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{sub}</p>
          </div>
        ))}
      </div>

      <div style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px", background: "var(--bg-elevated)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Budget vs Actual</h3>
          <button type="button" onClick={() => onTabChange("transactions")} style={{
            fontSize: 11, color: "var(--accent-text)", background: "none",
            border: "none", cursor: "pointer", fontWeight: 500,
          }}>+ Log expense →</button>
        </div>

        {summaries.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>
            No transactions yet this month
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {summaries.map((s) => {
              const over = s.spent > s.budgeted && s.budgeted > 0;
              const barColor = over ? "var(--hard)" : s.percent > 75 ? "var(--medium)" : s.color;
              return (
                <div key={s.category}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{s.category}</span>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: over ? "var(--hard)" : "var(--text-muted)" }}>
                        {cur}{s.spent.toLocaleString()}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-faint)" }}>/ {cur}{s.budgeted.toLocaleString()}</span>
                      {over && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--hard)", background: "var(--hard-bg)", padding: "1px 6px", borderRadius: 99 }}>OVER</span>}
                    </div>
                  </div>
                  <div style={{ height: 5, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.min(100, s.percent)}%`,
                      background: barColor, borderRadius: 99,
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {data.savings_goal > 0 && projection && (
        <div style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px", background: "var(--bg-elevated)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Savings Goal</h3>
            <span style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
              {cur}{data.savings_goal.toLocaleString()}
            </span>
          </div>
          <div style={{ height: 6, background: "var(--border)", borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
            <div style={{
              height: "100%",
              width: `${Math.min(100, projection.monthsToGoal ? Math.round((1 / projection.monthsToGoal) * 100) : 0)}%`,
              background: "linear-gradient(90deg, var(--accent), var(--accent-text))",
              borderRadius: 99, boxShadow: "0 0 8px var(--accent-glow)",
            }} />
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {projection.monthsToGoal
              ? `At budget pace: ${projection.monthsToGoal} months to reach goal`
              : "Set your budget in Settings to see projections"}
          </p>
        </div>
      )}
    </div>
  );
}
