"use client";

import { useState, useEffect } from "react";
import type { FinanceData } from "@/types";

interface Props {
  data: FinanceData;
  onSave: (d: FinanceData) => Promise<void>;
}

const FIELDS = [
  { key: "stipend",       label: "Monthly Stipend",   hint: "Your total income",    income: true  },
  { key: "rent",          label: "Rent Budget",        hint: "Monthly housing"                     },
  { key: "food",          label: "Food Budget",        hint: "Groceries + dining"                  },
  { key: "transport",     label: "Transport Budget",   hint: "Commute + fuel"                      },
  { key: "subscriptions", label: "Subscriptions",      hint: "Netflix, Spotify etc."               },
  { key: "misc",          label: "Misc / Other",       hint: "Buffer expenses"                     },
  { key: "savings_goal",  label: "Savings Goal",       hint: "Target amount",        goal: true    },
] as const;

export default function SettingsTab({ data, onSave }: Props) {
  const [form, setForm] = useState<FinanceData>(data);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  useEffect(() => { setForm(data); }, [data]);

  function change(key: keyof FinanceData, val: string) {
    setForm((p) => ({ ...p, [key]: parseFloat(val) || 0 }));
  }

  async function handleSave() {
    setSaving(true);
    await onSave(form);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const cur = form.currency ?? "₹";
  const totalBudget = (["rent","food","transport","subscriptions","misc"] as (keyof FinanceData)[])
    .reduce((s, k) => s + (Number(form[k]) || 0), 0);
  const plannedSavings = form.stipend - totalBudget;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, alignItems: "start" }}>
      <div style={{ border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", background: "var(--bg-elevated)" }}>
        <div style={{ padding: "18px 24px 14px", borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>Budget Settings</h3>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>Set your monthly income and expense budgets</p>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>Currency</label>
            <div style={{ display: "flex", gap: 6 }}>
              {(["₹", "$"] as const).map((c) => (
                <button key={c} type="button" onClick={() => setForm((p) => ({ ...p, currency: c }))} style={{
                  padding: "7px 20px", borderRadius: 9, fontSize: 14, fontWeight: 600,
                  cursor: "pointer", border: `1px solid ${form.currency === c ? "var(--accent)" : "var(--border)"}`,
                  background: form.currency === c ? "var(--accent)" : "transparent",
                  color: form.currency === c ? "#fff" : "var(--text-muted)",
                  transition: "all 0.15s",
                }}>{c}</button>
              ))}
            </div>
          </div>

          {FIELDS.map(({ key, label, hint, income, goal }: any) => (
            <div key={key}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
                  {label}
                  {income && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--accent-text)", background: "var(--accent-glow)", padding: "1px 6px", borderRadius: 99 }}>INCOME</span>}
                  {goal && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--easy)", background: "var(--easy-bg)", padding: "1px 6px", borderRadius: 99 }}>GOAL</span>}
                </label>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{hint}</span>
              </div>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--text-muted)", pointerEvents: "none" }}>{cur}</span>
                <input
                  type="number"
                  value={form[key as keyof FinanceData] as number || ""}
                  onChange={(e) => change(key as keyof FinanceData, e.target.value)}
                  placeholder="0"
                  style={{
                    width: "100%", padding: "10px 14px 10px 28px", borderRadius: 10,
                    border: `1px solid ${income ? "var(--accent-glow)" : "var(--border)"}`,
                    fontSize: 14, color: "var(--text-primary)",
                    background: "var(--bg-surface)", outline: "none", fontVariantNumeric: "tabular-nums",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
                  onBlur={(e)  => { e.target.style.borderColor = income ? "var(--accent-glow)" : "var(--border)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", background: "var(--bg-hover)" }}>
          <button type="button" onClick={handleSave} disabled={saving} style={{
            width: "100%", padding: 11, borderRadius: 10, border: "none",
            fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer",
            background: saved ? "var(--easy-bg)" : "var(--accent)",
            color: saved ? "var(--easy)" : "#fff",
            boxShadow: saved ? "none" : "0 0 14px var(--accent-glow)",
            transition: "all 0.2s",
          }}>
            {saved ? "✓ Saved" : saving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", background: "var(--bg-elevated)" }}>
          <h3 style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>
            Budget Preview
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Stipend",         value: form.stipend,     color: "var(--accent-text)" },
              { label: "Total Expenses",  value: -totalBudget,     color: "var(--hard)"        },
              { label: "Planned Savings", value: plannedSavings,   color: plannedSavings >= 0 ? "var(--easy)" : "var(--hard)" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color, letterSpacing: "-0.02em" }}>
                  {value < 0 ? "-" : ""}{cur}{Math.abs(value).toLocaleString()}
                </span>
              </div>
            ))}
            <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
            {form.savings_goal > 0 && plannedSavings > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Months to goal</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--accent-text)" }}>
                  {Math.ceil(form.savings_goal / plannedSavings)} months
                </span>
              </div>
            )}
          </div>
        </div>

        <div style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "16px 20px", background: "var(--bg-elevated)" }}>
          <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
            💡 These are your <strong style={{ color: "var(--text-secondary)" }}>budget targets</strong>. Log actual expenses in the Transactions tab to see how you compare and get accurate predictions.
          </p>
        </div>
      </div>
    </div>
  );
}
