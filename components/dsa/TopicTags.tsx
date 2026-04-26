"use client";

import type { TopicProgress } from "@/types";

interface Props {
  topicProgress: TopicProgress[];
  selected: string;
  onSelect: (topic: string) => void;
}

export default function TopicTags({ topicProgress, selected, onSelect }: Props) {
  const all = [{ topic: "All", total: topicProgress.reduce((s, t) => s + t.total, 0), done: topicProgress.reduce((s, t) => s + t.done, 0), solving: 0 }, ...topicProgress];

  return (
    <div style={{
      display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4,
      scrollbarWidth: "none",
    }}>
      <style>{`.topic-tags-scroll::-webkit-scrollbar { display: none; }`}</style>
      {all.map(({ topic, total, done }) => {
        const isActive = selected === topic;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        return (
          <button
            key={topic}
            onClick={() => onSelect(topic)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 99, flexShrink: 0,
              border: isActive ? "1px solid var(--accent)" : "1px solid var(--border)",
              background: isActive ? "var(--accent)" : "var(--bg-elevated)",
              color: isActive ? "#fff" : "var(--text-secondary)",
              fontSize: 12, fontWeight: isActive ? 600 : 400,
              cursor: "pointer",
              boxShadow: isActive ? "0 0 14px var(--accent-glow)" : "none",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                (e.currentTarget as HTMLElement).style.color = "var(--accent-text)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
              }
            }}
          >
            <span>{topic}</span>
            <span style={{
              fontSize: 10, fontWeight: 600, minWidth: 20, textAlign: "center",
              padding: "1px 6px", borderRadius: 99,
              background: isActive ? "rgba(255,255,255,0.2)" : "var(--bg-hover)",
              color: isActive ? "#fff" : pct > 0 ? "var(--easy)" : "var(--text-faint)",
            }}>
              {topic === "All" ? total : `${done}/${total}`}
            </span>
          </button>
        );
      })}
    </div>
  );
}
