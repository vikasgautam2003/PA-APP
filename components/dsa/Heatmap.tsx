import type { HeatmapEntry } from "@/types";

interface Props { heatmap: HeatmapEntry[]; }

function getLast365Days() {
  return Array.from({ length: 365 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (364 - i));
    return d.toISOString().split("T")[0];
  });
}

export default function Heatmap({ heatmap }: Props) {
  const days = getLast365Days();
  const map  = new Map(heatmap.map((h) => [h.date, h.count]));
  const weeks: string[][] = [];
  let week: string[] = [];
  days.forEach((d, i) => {
    week.push(d);
    if (week.length === 7 || i === days.length - 1) { weeks.push(week); week = []; }
  });

  const getColor = (n: number) => {
    if (n === 0) return "var(--border)";
    if (n === 1) return "var(--accent-glow)";
    if (n === 2) return "var(--accent)";
    if (n <= 4) return "var(--accent-text)";
    return "var(--accent-text)";
  };

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 16, padding: "20px 24px", background: "var(--bg-elevated)", boxShadow: "var(--shadow-card)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>Activity</span>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
          {heatmap.reduce((s, h) => s + h.count, 0)} solved · {heatmap.length} days
        </span>
      </div>
      <div style={{ display: "flex", gap: 3, overflowX: "auto" }}>
        {weeks.map((wk, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {wk.map((d) => (
              <div key={d} title={`${d}: ${map.get(d) ?? 0}`} style={{
                width: 12, height: 12, borderRadius: 3,
                background: getColor(map.get(d) ?? 0),
              }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}