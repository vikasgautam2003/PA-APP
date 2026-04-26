"use client";

import { useState, useEffect } from "react";
import type { FinanceData } from "@/types";

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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); onClose(); }
    finally { setSaving(false); }
  }

  const currency    = form.currency ?? "₹";
  const totalBudget = form.rent + form.food + form.transport + form.subscriptions + form.misc;
  const freeCash    = form.stipend - totalBudget;
  const sep: React.CSSProperties = { height: 1, background: "var(--border)", margin: "0 20px" };

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
              <div style={{ padding: "12px 24px 6px" }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-faint)" }}>
                  {group.label}
                </p>
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

          {/* Free cash summary */}
          <div style={{ margin: "12px 24px 0", padding: "14px 18px", borderRadius: 12, background: "var(--bg-base)", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "var(--text-faint)" }}>Total budgeted</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{currency}{totalBudget.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: freeCash < 0 ? "var(--hard)" : "var(--text-primary)" }}>
                {freeCash < 0 ? "Over budget" : "Unallocated"}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: freeCash < 0 ? "var(--hard)" : "var(--easy)" }}>
                {freeCash < 0 ? "−" : ""}{currency}{Math.abs(freeCash).toLocaleString()}
              </span>
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
