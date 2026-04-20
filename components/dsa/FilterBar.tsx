"use client";

import { useDSAStore } from "@/store/dsaStore";

const DIFFS = ["All","Easy","Medium","Hard"] as const;
const STATS = ["All","todo","solving","done"] as const;
const SL: Record<string,string> = { All:"All", todo:"Todo", solving:"Solving", done:"Done" };

export default function FilterBar() {
  const { topics, selectedTopic, filterDifficulty, filterStatus, searchQuery,
    setSelectedTopic, setFilterDifficulty, setFilterStatus, setSearchQuery } = useDSAStore();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search 1000 questions..."
        style={{
          width: "100%", padding: "12px 18px", borderRadius: 12,
          border: "1px solid var(--border)", fontSize: 14,
          color: "var(--text-primary)", background: "var(--bg-elevated)", outline: "none",
        }}
        onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
        onBlur={(e)  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
      />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} style={{
          padding: "8px 12px", borderRadius: 10, border: "1px solid var(--border)",
          fontSize: 12, color: "var(--text-secondary)", background: "var(--bg-elevated)", cursor: "pointer", outline: "none",
        }}>
          {topics.map((t) => <option key={t} value={t} style={{ background: "var(--bg-elevated)" }}>{t}</option>)}
        </select>

        {[{ items: DIFFS, active: filterDifficulty, set: setFilterDifficulty },
          { items: STATS, active: filterStatus,     set: setFilterStatus     }].map((group, gi) => (
          <div key={gi} style={{ display: "flex", gap: 4, background: "var(--bg-elevated)", padding: 4, borderRadius: 12, border: "1px solid var(--border)" }}>
            {group.items.map((item) => {
              const isActive = group.active === item;
              return (
                <button key={item} onClick={() => (group.set as (v: typeof item) => void)(item)} style={{
                  padding: "6px 14px", borderRadius: 9, fontSize: 12, fontWeight: isActive ? 600 : 400,
                  cursor: "pointer", border: "none",
                  background: isActive ? "var(--accent)" : "transparent",
                  color: isActive ? "#fff" : "var(--text-muted)",
                  boxShadow: isActive ? "0 0 12px var(--accent-glow)" : "none",
                }}>
                  {gi === 0 ? item : SL[item]}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}