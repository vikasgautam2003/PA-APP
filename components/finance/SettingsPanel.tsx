"use client";

import { useState, useEffect } from "react";
import type { FinanceData, TransactionCategory } from "@/types";
import { CATEGORIES } from "@/hooks/useFinance";

function Row({ color, label, hint, amount, strong }: {
  color: string; label: string; hint: string; amount: string; strong?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
        <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.2, minWidth: 0 }}>
          <span style={{ fontSize: 12, fontWeight: strong ? 600 : 500, color: "var(--text-primary)" }}>{label}</span>
          <span style={{ fontSize: 10, color: "var(--text-faint)" }}>{hint}</span>
        </span>
      </div>
      <span style={{ fontSize: 13, fontWeight: strong ? 700 : 600, color: strong ? color : "var(--text-primary)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
        {amount}
      </span>
    </div>
  );
}

interface Props {
  data: FinanceData;
  onSave: (d: FinanceData) => Promise<void>;
  onClose: () => void;
}

const GROUPS = [
  {
    label: "Income",
    fields: [
      { key: "stipend" as keyof FinanceData, label: "Monthly income", isDate: false },
    ],
  },
  {
    label: "Fixed",
    fields: [
      { key: "rent" as keyof FinanceData, label: "Rent / housing", isDate: false },
    ],
  },
  {
    label: "Monthly budgets",
    fields: [
      { key: "food" as keyof FinanceData, label: "Food & dining", isDate: false },
      { key: "transport" as keyof FinanceData, label: "Transport", isDate: false },
      { key: "subscriptions" as keyof FinanceData, label: "Subscriptions", isDate: false },
      { key: "misc" as keyof FinanceData, label: "Shopping / misc", isDate: false },
    ],
  },
  {
    label: "Goal",
    fields: [
      { key: "savings_goal" as keyof FinanceData, label: "Target amount", isDate: false },
      { key: "target_date" as keyof FinanceData, label: "Target date", isDate: true },
    ],
    hint: "1 year from today",
  },
  {
    label: "Savings target",
    fields: [
      { key: "year_goal" as keyof FinanceData, label: "By Dec 31 (optional)", isDate: false },
      { key: "monthly_savings_target" as keyof FinanceData, label: "Per month (optional)", isDate: false },
    ],
    hint2: "Per-month wins if both set",
  },
];

export default function SettingsPanel({ data, onSave, onClose }: Props) {
  const [form,   setForm]   = useState<FinanceData>({ ...data });
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm({ ...data }); }, [data]);

  function setField(key: keyof FinanceData, val: string) {
    setForm((f) => ({
      ...f,
      [key]: key === "target_date" || key === "currency"
        ? val
        : (parseFloat(val) || 0),
    }));
  }

  function toggleFixed(cat: TransactionCategory) {
    setForm((f) => {
      const list = f.fixed_categories ?? ["Rent"];
      const next = list.includes(cat) ? list.filter((c) => c !== cat) : [...list, cat];
      return { ...f, fixed_categories: next };
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); onClose(); }
    finally { setSaving(false); }
  }

  const currency    = form.currency ?? "₹";
  const otherBudgets = form.food + form.transport + form.subscriptions + form.misc;
  const monthsRemaining = Math.max(1, 12 - new Date().getMonth());
  const yearGoalMonthly = form.year_goal > 0 ? form.year_goal / monthsRemaining : 0;
  const effectiveSavings = form.monthly_savings_target > 0 ? form.monthly_savings_target : yearGoalMonthly;
  const savingsHint =
    form.monthly_savings_target > 0
      ? "monthly target"
      : form.year_goal > 0
        ? `${currency}${form.year_goal.toLocaleString()} ÷ ${monthsRemaining} mo`
        : "";
  const totalCommitted  = form.rent + otherBudgets + effectiveSavings;
  const freeCash        = form.stipend - totalCommitted;
  const overBudget      = freeCash < 0;
  const sep: React.CSSProperties = { height: 1, background: "var(--border)", margin: "0 20px" };

  const segments = [
    { key: "rent",      label: "Rent",       value: form.rent,        color: "#0891b2" },
    { key: "budgets",   label: "Budgets",    value: otherBudgets,     color: "#7c3aed" },
    { key: "savings",   label: "Savings",    value: effectiveSavings, color: "#0a84ff" },
    { key: "free",      label: "Free",       value: Math.max(0, freeCash), color: "#4ade80" },
  ].filter((s) => s.value > 0);
  const segTotal = segments.reduce((s, x) => s + x.value, 0) || 1;

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 90,
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)",
      }} />

      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 91,
        width: 380, background: "var(--bg-elevated)",
        borderLeft: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        boxShadow: "-32px 0 80px rgba(0,0,0,0.6)",
        animation: "slideIn 0.22s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
        `}</style>

        {/* Header */}
        <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>Settings</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text-faint)" }}>Budget configuration</p>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%",
            color: "var(--text-faint)", cursor: "pointer",
            width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>×</button>
        </div>

        <div style={{ height: 1, background: "var(--border)", flexShrink: 0 }} />

        {/* Currency */}
        <div style={{ padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Currency</span>
          <div style={{ display: "flex", background: "var(--bg-base)", borderRadius: 8, padding: 2, gap: 2 }}>
            {(["₹", "$"] as const).map((c) => (
              <button key={c} onClick={() => setForm((f) => ({ ...f, currency: c }))} style={{
                padding: "4px 14px", borderRadius: 6, fontSize: 14, fontWeight: 600,
                background: currency === c ? "rgba(255,255,255,0.10)" : "transparent",
                color: currency === c ? "var(--text-primary)" : "var(--text-faint)",
                border: "none", cursor: "pointer", transition: "all 0.1s",
              }}>{c}</button>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: "var(--border)", flexShrink: 0 }} />

        {/* Form */}
        <form onSubmit={handleSave} style={{ flex: 1, overflowY: "auto" }}>
          {GROUPS.map((group, gi) => (
            <div key={group.label}>
              {gi > 0 && <div style={{ height: 8, background: "var(--bg-base)" }} />}
              <div style={{ padding: "12px 24px 6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-faint)" }}>
                  {group.label}
                </p>
                {"hint" in group && (
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setFullYear(d.getFullYear() + 1);
                      setForm((f) => ({ ...f, target_date: d.toISOString().slice(0, 10) }));
                    }}
                    style={{
                      fontSize: 11, color: "#0a84ff", background: "none",
                      border: "none", cursor: "pointer", padding: 0, fontWeight: 500,
                    }}
                  >1 year from today</button>
                )}
                {"hint2" in group && (
                  <span style={{ fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.02em" }}>
                    {(group as { hint2: string }).hint2}
                  </span>
                )}
              </div>
              <div style={{ background: "var(--bg-elevated)" }}>
                {group.fields.map((f, fi) => (
                  <div key={f.key}>
                    {fi > 0 && <div style={sep} />}
                    <div style={{ padding: "13px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 400 }}>{f.label}</label>
                      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                        {!f.isDate && <span style={{ fontSize: 14, color: "var(--text-faint)" }}>{currency}</span>}
                        <input
                          type={f.isDate ? "date" : "number"}
                          min={f.isDate ? undefined : "0"}
                          step={f.isDate ? undefined : "100"}
                          value={f.isDate ? (form[f.key] as string ?? "") : (form[f.key] as number ?? 0)}
                          onChange={(e) => setField(f.key, e.target.value)}
                          style={{
                            background: "none", border: "none", outline: "none",
                            fontSize: 14, fontWeight: 500,
                            color: "var(--text-primary)",
                            textAlign: "right", width: f.isDate ? 120 : 100,
                            fontVariantNumeric: f.isDate ? "normal" : "tabular-nums",
                            cursor: f.isDate ? "pointer" : "text",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Permanent categories — excluded from daily allowance & savings projection */}
          <div style={{ height: 8, background: "var(--bg-base)" }} />
          <div style={{ padding: "12px 24px 6px" }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-faint)" }}>
              Permanent categories
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--text-faint)" }}>
              Necessities — logged but excluded from daily allowance & savings forecast
            </p>
          </div>
          <div style={{ background: "var(--bg-elevated)", padding: "8px 24px 14px", display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CATEGORIES.map((cat) => {
              const on = (form.fixed_categories ?? ["Rent"]).includes(cat);
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleFixed(cat)}
                  style={{
                    padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                    background: on ? "rgba(10,132,255,0.18)" : "var(--bg-base)",
                    border: `1px solid ${on ? "rgba(10,132,255,0.45)" : "var(--border)"}`,
                    color: on ? "#0a84ff" : "var(--text-faint)",
                    cursor: "pointer", transition: "all 0.12s",
                  }}
                >{on ? "✓ " : ""}{cat}</button>
              );
            })}
          </div>

          {/* Where your monthly income goes — visual breakdown */}
          <div style={{ margin: "12px 24px 0", padding: "16px 18px", borderRadius: 12, background: "var(--bg-base)", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Where your {currency}{form.stipend.toLocaleString()} goes</span>
              {overBudget && (
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--hard)", letterSpacing: "0.05em" }}>
                  OVER BY {currency}{Math.abs(freeCash).toLocaleString()}
                </span>
              )}
            </div>

            {/* Stacked bar */}
            <div style={{
              display: "flex", height: 8, borderRadius: 99, overflow: "hidden",
              background: "rgba(255,255,255,0.05)", marginBottom: 14,
            }}>
              {segments.map((s) => (
                <div key={s.key} style={{
                  flex: s.value / segTotal,
                  background: s.color,
                  borderRight: "2px solid var(--bg-base)",
                }} title={`${s.label}: ${currency}${Math.round(s.value).toLocaleString()}`} />
              ))}
            </div>

            {/* Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {form.rent > 0 && (
                <Row color="#0891b2" label="Rent" hint="fixed" amount={`${currency}${form.rent.toLocaleString()}`} />
              )}
              {otherBudgets > 0 && (
                <Row color="#7c3aed" label="Other budgets" hint="food, transport, subs, misc" amount={`${currency}${otherBudgets.toLocaleString()}`} />
              )}
              {effectiveSavings > 0 && (
                <Row color="#0a84ff" label="Savings target" hint={savingsHint} amount={`${currency}${Math.round(effectiveSavings).toLocaleString()}`} />
              )}
              <Row
                color={overBudget ? "#f87171" : "#4ade80"}
                label={overBudget ? "Shortfall" : "Free to spend or save"}
                hint={overBudget ? "trim something above" : "not yet committed"}
                amount={`${overBudget ? "−" : ""}${currency}${Math.abs(freeCash).toLocaleString()}`}
                strong
              />
            </div>
          </div>

          <div style={{ padding: "20px 24px 32px" }}>
            <button type="submit" disabled={saving} style={{
              width: "100%", padding: "13px 0", borderRadius: 12,
              fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer",
              background: "var(--accent)", color: "#fff",
              opacity: saving ? 0.6 : 1, transition: "opacity 0.15s",
            }}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
