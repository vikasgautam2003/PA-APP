"use client";

import { useDSAStore } from "@/store/dsaStore";

const DIFFS = ["All", "Easy", "Medium", "Hard"] as const;
const STATS = ["All", "todo", "solving", "done"] as const;
const SL: Record<string, string> = { All: "All", todo: "Todo", solving: "Solving", done: "Done" };

export default function FilterBar() {
  const {
    filterDifficulty, filterStatus, searchQuery,
    setFilterDifficulty, setFilterStatus, setSearchQuery,
  } = useDSAStore();

  const isDirty = filterDifficulty !== "All" || filterStatus !== "All" || searchQuery !== "";

  function clearFilters() {
    setFilterDifficulty("All");
    setFilterStatus("All");
    setSearchQuery("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Search */}
      <div style={{ position: "relative" }}>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search questions..."
          style={{
            width: "100%", padding: "11px 16px", borderRadius: 10,
            border: "1px solid var(--border)", fontSize: 13,
            color: "var(--text-primary)", background: "var(--bg-elevated)",
            outline: "none", boxSizing: "border-box",
          }}
          onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
          onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", color: "var(--text-faint)",
              cursor: "pointer", fontSize: 16, lineHeight: 1,
            }}
          >×</button>
        )}
      </div>

      {/* Filter pills + clear */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {([
          { items: DIFFS, active: filterDifficulty, set: setFilterDifficulty },
          { items: STATS, active: filterStatus,     set: setFilterStatus     },
        ] as const).map((group, gi) => (
          <div key={gi} style={{
            display: "flex", gap: 3,
            background: "var(--bg-elevated)", padding: 3,
            borderRadius: 10, border: "1px solid var(--border)",
          }}>
            {group.items.map((item) => {
              const on = group.active === item;
              const diffColors: Record<string, string> = {
                Easy: "var(--easy)", Medium: "var(--medium)", Hard: "var(--hard)",
              };
              const bg = on
                ? (gi === 0 && item !== "All" ? diffColors[item] ?? "var(--accent)" : "var(--accent)")
                : "transparent";
              return (
                <button
                  key={item}
                  onClick={() => (group.set as (v: typeof item) => void)(item)}
                  style={{
                    padding: "5px 14px", borderRadius: 8, fontSize: 12,
                    fontWeight: on ? 600 : 400, cursor: "pointer", border: "none",
                    background: bg,
                    color: on ? "#fff" : "var(--text-muted)",
                    boxShadow: on ? "0 0 10px var(--accent-glow)" : "none",
                    transition: "all 0.12s",
                  }}
                >
                  {gi === 0 ? item : SL[item]}
                </button>
              );
            })}
          </div>
        ))}

        {/* Clear button — only when something is active */}
        {isDirty && (
          <button
            onClick={clearFilters}
            style={{
              padding: "5px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
              border: "1px solid var(--border)", background: "var(--bg-elevated)",
              color: "var(--text-muted)", cursor: "pointer",
              transition: "all 0.12s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--hard)";
              (e.currentTarget as HTMLElement).style.color = "var(--hard)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            }}
          >
            Clear ×
          </button>
        )}
      </div>
    </div>
  );
}
