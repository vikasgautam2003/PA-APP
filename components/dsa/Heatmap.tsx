import type { HeatmapEntry } from "@/types";

interface Props { heatmap: HeatmapEntry[]; }

function getLast365Days() {
  return Array.from({ length: 365 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (364 - i));
    return d.toISOString().split("T")[0];
  });
}

function color(n: number) {
  if (n === 0) return "#f3f4f6";
  if (n === 1) return "#bfdbfe";
  if (n === 2) return "#93c5fd";
  if (n <= 4)  return "#3b82f6";
  return "#1d4ed8";
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

  return (
    <div style={{ border: "1px solid #f0f0f0", borderRadius: 12, padding: 16, background: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>Activity</span>
        <span style={{ fontSize: 11, color: "#9ca3af" }}>
          {heatmap.reduce((s, h) => s + h.count, 0)} solved · {heatmap.length} days
        </span>
      </div>
      <div style={{ display: "flex", gap: 3, overflowX: "auto" }}>
        {weeks.map((wk, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {wk.map((d) => (
              <div key={d} title={`${d}: ${map.get(d) ?? 0}`} style={{
                width: 11, height: 11, borderRadius: 3,
                background: color(map.get(d) ?? 0),
              }} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 10, justifyContent: "flex-end" }}>
        <span style={{ fontSize: 10, color: "#d1d5db" }}>Less</span>
        {["#f3f4f6","#bfdbfe","#93c5fd","#3b82f6","#1d4ed8"].map((c) => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
        ))}
        <span style={{ fontSize: 10, color: "#d1d5db" }}>More</span>
      </div>
    </div>
  );
}