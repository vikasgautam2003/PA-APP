import type { ExpenseBreakdown } from "@/types";

interface Props { breakdown: ExpenseBreakdown[]; stipend: number; }

export default function ExpenseDonut({ breakdown, stipend }: Props) {
  if (breakdown.length === 0) return null;

  const total = breakdown.reduce((s, b) => s + b.amount, 0);
  const saved = stipend - total;
  const savedPct = stipend > 0 ? Math.round((saved / stipend) * 100) : 0;

  // Build SVG donut
  const R = 60, cx = 80, cy = 80, stroke = 22;
  const circ = 2 * Math.PI * R;
  let offset = 0;

  const allItems = [
    ...breakdown,
    ...(saved > 0 ? [{ label: "Savings", amount: saved, percent: savedPct, color: "var(--easy)" }] : []),
  ];

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 16, padding: "20px 24px", background: "var(--bg-elevated)" }}>
      <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 18 }}>
        Expense Breakdown
      </h3>

      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        {/* Donut */}
        <div style={{ flexShrink: 0, position: "relative" }}>
          <svg width={160} height={160} viewBox="0 0 160 160">
            <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--border)" strokeWidth={stroke} />
            {allItems.map((item, i) => {
              const pct = total + (saved > 0 ? saved : 0) > 0
                ? item.amount / (stipend || 1)
                : 0;
              const dash = pct * circ;
              const gap  = circ - dash;
              const seg = (
                <circle
                  key={i}
                  cx={cx} cy={cy} r={R}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${dash} ${gap}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "all 0.5s ease" }}
                />
              );
              offset += dash;
              return seg;
            })}
          </svg>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
              {savedPct}%
            </span>
            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>saved</span>
          </div>
        </div>

        {/* Legend */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          {allItems.map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "var(--text-secondary)", flex: 1 }}>{item.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
                {item.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}