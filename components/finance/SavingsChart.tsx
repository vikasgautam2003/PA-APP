import type { SavingsProjection, FinanceData } from "@/types";

interface Props {
  projection: SavingsProjection | null;
  data: FinanceData;
}

export default function SavingsChart({ projection, data }: Props) {
  if (!projection) return null;

  const fmt = (n: number) =>
    n >= 100000
      ? `₹${(n / 100000).toFixed(1)}L`
      : n >= 1000
      ? `₹${(n / 1000).toFixed(1)}K`
      : `₹${n.toFixed(0)}`;

  const bars = [
    { label: "1 Month",  value: projection.monthly,    max: projection.yearly },
    { label: "3 Months", value: projection.threeMonth,  max: projection.yearly },
    { label: "6 Months", value: projection.sixMonth,    max: projection.yearly },
    { label: "1 Year",   value: projection.yearly,      max: projection.yearly },
  ];

  const goalPct = data.savings_goal > 0
    ? Math.min(100, Math.round((projection.monthly / data.savings_goal) * 100))
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Savings projection bars */}
      <div style={{ border: "1px solid var(--border)", borderRadius: 16, padding: "20px 24px", background: "var(--bg-elevated)" }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 18, letterSpacing: "-0.01em" }}>
          Savings Projection
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {bars.map(({ label, value, max }) => {
            const pct = max > 0 ? Math.round((value / max) * 100) : 0;
            const isNeg = value < 0;
            return (
              <div key={label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: isNeg ? "var(--hard)" : "var(--text-primary)", letterSpacing: "-0.02em" }}>
                    {isNeg ? "-" : ""}{fmt(Math.abs(value))}
                  </span>
                </div>
                <div style={{ height: 6, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${Math.max(0, pct)}%`,
                    background: isNeg
                      ? "var(--hard)"
                      : "linear-gradient(90deg, var(--accent), var(--accent-text))",
                    borderRadius: 99,
                    boxShadow: isNeg ? "none" : "0 0 8px var(--accent-glow)",
                    transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { label: "Weekly Spend",    value: fmt(projection.weeklySpend),          color: "var(--medium)" },
          { label: "Monthly Savings", value: fmt(projection.monthly),               color: projection.monthly >= 0 ? "var(--easy)" : "var(--hard)" },
          { label: "Months to Goal",  value: projection.monthsToGoal ? `${projection.monthsToGoal} mo` : "—", color: "var(--accent-text)" },
          { label: "Goal Progress",   value: data.savings_goal > 0 ? `${goalPct}%/mo` : "—", color: "var(--accent-text)" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            border: "1px solid var(--border)", borderRadius: 12,
            padding: "14px 16px", background: "var(--bg-elevated)",
          }}>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color, letterSpacing: "-0.03em" }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}