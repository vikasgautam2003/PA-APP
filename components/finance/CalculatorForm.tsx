"use client";

import { useState, useEffect } from "react";
import type { FinanceData } from "@/types";

interface Props {
  data: FinanceData;
  onSave: (d: FinanceData) => Promise<void>;
}

const FIELDS: { key: keyof FinanceData; label: string; hint: string }[] = [
  { key: "stipend",       label: "Monthly Stipend",   hint: "Your total monthly income" },
  { key: "rent",          label: "Rent",               hint: "Monthly rent / housing" },
  { key: "food",          label: "Food",               hint: "Groceries + dining" },
  { key: "transport",     label: "Transport",          hint: "Commute + fuel" },
  { key: "subscriptions", label: "Subscriptions",      hint: "Netflix, Spotify, etc." },
  { key: "misc",          label: "Miscellaneous",      hint: "Buffer / variable expenses" },
  { key: "savings_goal",  label: "Savings Goal",       hint: "Target amount to save" },
];

export default function CalculatorForm({ data, onSave }: Props) {
  const [form, setForm] = useState<FinanceData>(data);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setForm(data); }, [data]);

  function handleChange(key: keyof FinanceData, val: string) {
    setForm((prev) => ({ ...prev, [key]: parseFloat(val) || 0 }));
  }

  async function handleSave() {
    setSaving(true);
    await onSave(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{
      border: "1px solid var(--border)", borderRadius: 16,
      background: "var(--bg-elevated)", overflow: "hidden",
    }}>
      <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Financial Profile
        </h2>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
          All values in ₹ per month
        </p>
      </div>

      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        {FIELDS.map(({ key, label, hint }) => (
          <div key={key}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>
                {label}
                {key === "stipend" && (
                  <span style={{ marginLeft: 6, fontSize: 10, color: "var(--accent)", fontWeight: 600, background: "var(--accent-glow)", padding: "1px 6px", borderRadius: 99 }}>
                    INCOME
                  </span>
                )}
              </label>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{hint}</span>
            </div>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                fontSize: 13, color: "var(--text-muted)", pointerEvents: "none",
              }}>₹</span>
              <input
                type="number"
                value={form[key] as number || ""}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder="0"
                style={{
                  width: "100%", padding: "10px 14px 10px 28px",
                  borderRadius: 10, border: "1px solid var(--border)",
                  fontSize: 14, color: "var(--text-primary)",
                  background: "var(--bg-surface)", outline: "none",
                  fontVariantNumeric: "tabular-nums",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
                onBlur={(e)  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", background: "var(--bg-hover)" }}>
        <button onClick={handleSave} disabled={saving} style={{
          width: "100%", padding: "11px", borderRadius: 10, border: "none",
          fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer",
          background: saved ? "var(--easy-bg)" : "var(--accent)",
          color: saved ? "var(--easy)" : "#fff",
          boxShadow: saved ? "none" : "0 0 16px var(--accent-glow)",
          transition: "all 0.2s ease",
        }}>
          {saved ? "✓ Saved" : saving ? "Saving…" : "Save & Calculate"}
        </button>
      </div>
    </div>
  );
}