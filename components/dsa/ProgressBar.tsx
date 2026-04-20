import type { TopicProgress } from "@/types";

interface Props { topicProgress: TopicProgress[]; totalDone: number; total: number; }

export default function ProgressBar({ topicProgress, totalDone, total }: Props) {
  const pct = total > 0 ? Math.round((totalDone / total) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ border: "1px solid var(--border)", borderRadius: 16, padding: "20px 24px", background: "var(--bg-elevated)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>Overall Progress</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            {totalDone}<span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 400 }}> / {total}</span>
          </span>
        </div>
        <div style={{ height: 6, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            background: "linear-gradient(90deg, var(--accent), var(--accent-text))",
            borderRadius: 99, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: "0 0 12px var(--accent-glow)",
          }} />
        </div>
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>{pct}% complete</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {topicProgress.slice(0, 8).map((t) => {
          const p = t.total > 0 ? Math.round((t.done / t.total) * 100) : 0;
          return (
            <div key={t.topic} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px", background: "var(--bg-elevated)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 100 }}>{t.topic}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{t.done}/{t.total}</span>
              </div>
              <div style={{ height: 3, background: "var(--border)", borderRadius: 99 }}>
                <div style={{ height: "100%", width: `${p}%`, background: "var(--accent)", borderRadius: 99 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}