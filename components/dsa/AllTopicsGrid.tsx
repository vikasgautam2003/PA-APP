"use client";

import type { TopicProgress } from "@/types";

interface Props {
  topicProgress: TopicProgress[];
  selected: string;
  onSelect: (topic: string) => void;
}

export default function AllTopicsGrid({ topicProgress, selected, onSelect }: Props) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: 10,
    }}>
      {topicProgress.map((t) => {
        const pct = t.total > 0 ? Math.round((t.done / t.total) * 100) : 0;
        const isActive = selected === t.topic;

        return (
          <button
            key={t.topic}
            onClick={() => onSelect(isActive ? "All" : t.topic)}
            style={{
              display: "flex", flexDirection: "column", gap: 10,
              padding: "16px 18px", borderRadius: 14, textAlign: "left",
              border: isActive ? "1px solid var(--accent)" : "1px solid var(--border)",
              background: isActive ? "var(--accent-glow)" : "var(--bg-elevated)",
              cursor: "pointer",
              boxShadow: isActive ? "0 0 14px var(--accent-glow)" : "var(--shadow-card)",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
              }
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{
                fontSize: 13, fontWeight: 600,
                color: isActive ? "var(--accent-text)" : "var(--text-primary)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                maxWidth: 130, lineHeight: 1.3,
              }}>
                {t.topic}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 600, flexShrink: 0, marginLeft: 8,
                color: pct === 100 ? "var(--easy)" : pct > 0 ? "var(--accent-text)" : "var(--text-faint)",
              }}>
                {t.done}/{t.total}
              </span>
            </div>

            <div style={{ height: 3, background: "var(--border)", borderRadius: 99 }}>
              <div style={{
                height: "100%", width: `${pct}%`,
                background: pct === 100 ? "var(--easy)" : "var(--accent)",
                borderRadius: 99, transition: "width 0.6s ease",
              }} />
            </div>

            {t.solving > 0 && (
              <span style={{ fontSize: 10, color: "var(--medium)" }}>{t.solving} in progress</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
