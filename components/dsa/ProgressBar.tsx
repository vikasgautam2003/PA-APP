import type { TopicProgress } from "@/types";

interface Props {
  topicProgress: TopicProgress[];
  totalDone: number;
  total: number;
}

export default function ProgressBar({ topicProgress, totalDone, total }: Props) {
  const pct = total > 0 ? Math.round((totalDone / total) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* Overall */}
      <div style={{ border: "1px solid #f0f0f0", borderRadius: 12, padding: 16, background: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>Overall Progress</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#2563eb" }}>{totalDone} / {total}</span>
        </div>
        <div style={{ height: 6, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "#2563eb", borderRadius: 99, transition: "width 0.6s ease" }} />
        </div>
        <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>{pct}% complete</p>
      </div>

      {/* Topics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {topicProgress.slice(0, 8).map((t) => {
          const p = t.total > 0 ? Math.round((t.done / t.total) * 100) : 0;
          return (
            <div key={t.topic} style={{ border: "1px solid #f0f0f0", borderRadius: 10, padding: "10px 12px", background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 90 }}>{t.topic}</span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>{t.done}/{t.total}</span>
              </div>
              <div style={{ height: 3, background: "#f3f4f6", borderRadius: 99 }}>
                <div style={{ height: "100%", width: `${p}%`, background: "#2563eb", borderRadius: 99 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}