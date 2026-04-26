"use client";

type Tab = "overview" | "transactions" | "predictions" | "settings";

interface Props {
  active: Tab;
  onChange: (t: Tab) => void;
  counts?: { transactions: number };
}

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",      label: "Overview"      },
  { id: "transactions",  label: "Transactions"  },
  { id: "predictions",   label: "Predictions"   },
  { id: "settings",      label: "Settings"      },
];

export default function TabBar({ active, onChange, counts }: Props) {
  return (
    <div style={{
      display: "flex", gap: 1,
      background: "var(--bg-base)",
      border: "1px solid var(--border)",
      borderRadius: 10, padding: 3,
      width: "fit-content",
    }}>
      {TABS.map(({ id, label }) => {
        const isActive = active === id;
        const count = id === "transactions" ? counts?.transactions : undefined;
        return (
          <button key={id} onClick={() => onChange(id)} type="button" style={{
            padding: "6px 16px", borderRadius: 7, fontSize: 13,
            fontWeight: isActive ? 600 : 400, cursor: "pointer",
            border: "none",
            background: isActive ? "var(--bg-surface)" : "transparent",
            color: isActive ? "var(--text-primary)" : "var(--text-muted)",
            boxShadow: isActive ? "var(--shadow-card)" : "none",
            transition: "all 0.12s",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            {label}
            {count !== undefined && count > 0 && (
              <span style={{
                fontSize: 10, fontWeight: 700,
                background: isActive ? "var(--accent)" : "var(--accent-glow)",
                color: isActive ? "#fff" : "var(--accent-text)",
                padding: "1px 6px", borderRadius: 99,
              }}>{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
