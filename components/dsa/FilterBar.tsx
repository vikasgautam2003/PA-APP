"use client";

import { useDSAStore } from "@/store/dsaStore";

const DIFFS   = ["All","Easy","Medium","Hard"] as const;
const STATS   = ["All","todo","solving","done"] as const;
const SLABELS: Record<string,string> = { All:"All", todo:"Todo", solving:"Solving", done:"Done" };
const DCOLORS: Record<string,string> = { Easy:"#16a34a", Medium:"#d97706", Hard:"#dc2626", All:"#2563eb" };

export default function FilterBar() {
  const { topics, selectedTopic, filterDifficulty, filterStatus, searchQuery,
    setSelectedTopic, setFilterDifficulty, setFilterStatus, setSearchQuery } = useDSAStore();

  const pillBase = { padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "none", transition: "all 0.1s" } as React.CSSProperties;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Search */}
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search questions..."
        style={{
          width: "100%", padding: "9px 14px", borderRadius: 9,
          border: "1px solid #e5e5e5", fontSize: 13, color: "#111827",
          background: "#fafafa", outline: "none",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
        onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")}
      />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {/* Topic select */}
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          style={{
            padding: "5px 10px", borderRadius: 8, border: "1px solid #e5e5e5",
            fontSize: 12, color: "#374151", background: "#fff", cursor: "pointer", outline: "none",
          }}
        >
          {topics.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Difficulty */}
        <div style={{ display: "flex", gap: 3, background: "#f5f5f5", padding: 3, borderRadius: 9 }}>
          {DIFFS.map((d) => {
            const active = filterDifficulty === d;
            return (
              <button key={d} onClick={() => setFilterDifficulty(d)} style={{
                ...pillBase,
                background: active ? "#fff" : "transparent",
                color: active ? DCOLORS[d] : "#9ca3af",
                boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}>{d}</button>
            );
          })}
        </div>

        {/* Status */}
        <div style={{ display: "flex", gap: 3, background: "#f5f5f5", padding: 3, borderRadius: 9 }}>
          {STATS.map((s) => {
            const active = filterStatus === s;
            return (
              <button key={s} onClick={() => setFilterStatus(s)} style={{
                ...pillBase,
                background: active ? "#fff" : "transparent",
                color: active ? "#2563eb" : "#9ca3af",
                boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}>{SLABELS[s]}</button>
            );
          })}
        </div>
      </div>
    </div>
  );
}