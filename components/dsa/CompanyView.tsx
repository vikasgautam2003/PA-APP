"use client";

import type { CompanyProgress } from "@/types";

const COMPANY_COLORS = [
  { bg: "#1e3a5f", text: "#60a5fa" },
  { bg: "#1e3a2f", text: "#4ade80" },
  { bg: "#3a1e1e", text: "#f87171" },
  { bg: "#2d1e3a", text: "#c084fc" },
  { bg: "#1e2d3a", text: "#38bdf8" },
  { bg: "#3a2d1e", text: "#fb923c" },
];

function companyColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COMPANY_COLORS[Math.abs(hash) % COMPANY_COLORS.length];
}

interface Props {
  companyProgress: CompanyProgress[];
  selectedCompany: string;
  onSelect: (company: string) => void;
}

export default function CompanyView({ companyProgress, selectedCompany, onSelect }: Props) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
      gap: 10,
    }}>
      {companyProgress.map((c) => {
        const col = companyColor(c.company);
        const pct = c.total > 0 ? Math.round((c.done / c.total) * 100) : 0;
        const active = selectedCompany === c.company;

        return (
          <button
            key={c.company}
            onClick={() => onSelect(active ? "All" : c.company)}
            style={{
              display: "flex", flexDirection: "column", gap: 10,
              padding: "16px 18px", borderRadius: 14, textAlign: "left",
              background: active ? col.bg : "var(--bg-elevated)",
              border: active ? `1px solid ${col.text}66` : `1px solid var(--border)`,
              cursor: "pointer",
              boxShadow: active ? `0 0 14px ${col.text}22` : "var(--shadow-card)",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!active) {
                (e.currentTarget as HTMLElement).style.borderColor = col.text + "44";
                (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)";
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
              }
            }}
          >
            {/* Name row */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                background: col.text,
                boxShadow: active ? `0 0 6px ${col.text}` : "none",
              }} />
              <span style={{
                fontSize: 13, fontWeight: 600, lineHeight: 1.2,
                color: active ? col.text : "var(--text-primary)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {c.company}
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ height: 3, background: active ? `${col.text}33` : "var(--border)", borderRadius: 99 }}>
              <div style={{ height: "100%", width: `${pct}%`, background: col.text, borderRadius: 99 }} />
            </div>

            {/* Count + total badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: active ? col.text : "var(--text-faint)" }}>
                {c.done}/{c.total}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                background: active ? `${col.text}25` : col.bg,
                color: col.text,
              }}>
                {c.total}q
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
