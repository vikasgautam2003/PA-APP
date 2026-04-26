interface Props {
  totalDone: number;
  total: number;
  easySolved: number; easyTotal: number;
  medSolved: number;  medTotal: number;
  hardSolved: number; hardTotal: number;
}

export default function ProgressBar({ totalDone, total, easySolved, easyTotal, medSolved, medTotal, hardSolved, hardTotal }: Props) {
  const pct = total > 0 ? Math.round((totalDone / total) * 100) : 0;

  const diffs = [
    { label: "Easy",   solved: easySolved, tot: easyTotal, color: "var(--easy)",   bg: "var(--easy-bg)"   },
    { label: "Medium", solved: medSolved,  tot: medTotal,  color: "var(--medium)", bg: "var(--medium-bg)" },
    { label: "Hard",   solved: hardSolved, tot: hardTotal, color: "var(--hard)",   bg: "var(--hard-bg)"   },
  ];

  return (
    <div style={{
      border: "1px solid var(--border)", borderRadius: 16, padding: "20px 22px",
      background: "var(--bg-elevated)", boxShadow: "var(--shadow-card)",
      display: "flex", flexDirection: "column", gap: 14,
    }}>
      {/* Overall */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>Overall Progress</span>
        <span style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
          {totalDone}
          <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 400 }}> / {total}</span>
        </span>
      </div>

      {/* Bar */}
      <div>
        <div style={{ height: 7, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            background: "linear-gradient(90deg, var(--accent), var(--accent-text))",
            borderRadius: 99, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: "0 0 10px var(--accent-glow)",
          }} />
        </div>
        <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 5 }}>{pct}% complete</p>
      </div>

      {/* Difficulty cards — vertical layout so label never squishes into count */}
      <div style={{ display: "flex", gap: 8 }}>
        {diffs.map(({ label, solved, tot, color, bg }) => {
          const p = tot > 0 ? Math.round((solved / tot) * 100) : 0;
          return (
            <div key={label} style={{
              flex: 1, display: "flex", flexDirection: "column", gap: 8,
              padding: "12px 14px", borderRadius: 10,
              background: bg, border: `1px solid ${color}25`,
              minWidth: 0,
            }}>
              {/* Label row */}
              <span style={{
                fontSize: 11, fontWeight: 700, color,
                letterSpacing: "0.02em",
              }}>
                {label}
              </span>

              {/* Count */}
              <span style={{ fontSize: 16, fontWeight: 700, color, lineHeight: 1 }}>
                {solved}
                <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.6 }}>
                  {" "}/{tot}
                </span>
              </span>

              {/* Mini bar */}
              <div style={{ height: 2, background: `${color}28`, borderRadius: 99 }}>
                <div style={{ height: "100%", width: `${p}%`, background: color, borderRadius: 99 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
