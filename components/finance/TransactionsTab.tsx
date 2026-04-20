"use client";

import { useState } from "react";
import type { Transaction, TransactionFormData, TransactionCategory } from "@/types";
import { CATEGORIES, CATEGORY_COLORS } from "@/hooks/useFinance";

interface Props {
  transactions: Transaction[];
  currency: string;
  onAdd: (f: TransactionFormData) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function TransactionsTab({ transactions, currency, onAdd, onDelete }: Props) {
  const [amount, setAmount]     = useState("");
  const [category, setCategory] = useState<TransactionCategory>("Food");
  const [note, setNote]         = useState("");
  const [date, setDate]         = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving]     = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  async function handleAdd() {
    if (!amount || parseFloat(amount) <= 0) return;
    setSaving(true);
    await onAdd({ amount: parseFloat(amount), category, note, date });
    setAmount(""); setNote("");
    setSaving(false);
  }

  const inputStyle: React.CSSProperties = {
    padding: "10px 14px", borderRadius: 10,
    border: "1px solid var(--border)", fontSize: 13,
    color: "var(--text-primary)", background: "var(--bg-elevated)",
    outline: "none",
  };

  const totalThisMonth = transactions.reduce((s, t) => s + t.amount, 0);
  const grouped: Record<string, Transaction[]> = {};
  transactions.forEach((t) => {
    if (!grouped[t.date]) grouped[t.date] = [];
    grouped[t.date].push(t);
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 20, alignItems: "start" }}>
      <div style={{ border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", background: "var(--bg-elevated)" }}>
        <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>Log Expense</h3>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>Track what you spent</p>
        </div>

        <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Amount</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--text-muted)" }}>
                {currency}
              </span>
              <input
                type="number" value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                style={{ ...inputStyle, width: "100%", paddingLeft: 28 }}
                onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
                onBlur={(e)  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Category</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {CATEGORIES.map((c) => {
                const active = category === c;
                const color = CATEGORY_COLORS[c];
                return (
                  <button key={c} type="button" onClick={() => setCategory(c)} style={{
                    padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 500,
                    cursor: "pointer", border: `1px solid ${active ? color : "var(--border)"}`,
                    background: active ? `${color}20` : "transparent",
                    color: active ? color : "var(--text-muted)",
                    transition: "all 0.15s",
                  }}>{c}</button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Note <span style={{ color: "var(--text-faint)" }}>(optional)</span></label>
            <input
              value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Lunch at office"
              style={{ ...inputStyle, width: "100%" }}
              onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Date</label>
            <input
              type="date" value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ ...inputStyle, width: "100%" }}
              onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
            />
          </div>
        </div>

        <div style={{ padding: "14px 22px", borderTop: "1px solid var(--border)", background: "var(--bg-hover)" }}>
          <button type="button" onClick={handleAdd} disabled={saving || !amount} style={{
            width: "100%", padding: 11, borderRadius: 10, border: "none",
            fontSize: 13, fontWeight: 600,
            cursor: saving || !amount ? "not-allowed" : "pointer",
            background: saving || !amount ? "var(--border)" : "var(--accent)",
            color: saving || !amount ? "var(--text-muted)" : "#fff",
            boxShadow: saving || !amount ? "none" : "0 0 14px var(--accent-glow)",
            transition: "all 0.15s",
          }}>
            {saving ? "Saving…" : "Add Expense"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{
          border: "1px solid var(--border)", borderRadius: 12,
          padding: "14px 20px", background: "var(--bg-elevated)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
            Total spent this month
          </span>
          <span style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            {currency}{totalThisMonth.toLocaleString()}
          </span>
        </div>

        {transactions.length === 0 ? (
          <div style={{
            border: "1px solid var(--border)", borderRadius: 14,
            padding: "48px 24px", background: "var(--bg-elevated)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 32 }}>◎</span>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>No expenses logged yet</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Add your first expense using the form</p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, txns]) => (
            <div key={date}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
                {new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {txns.map((t) => {
                  const color = CATEGORY_COLORS[t.category as TransactionCategory] ?? "#6b7280";
                  return (
                    <div key={t.id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "11px 16px", borderRadius: 12,
                      border: "1px solid var(--border)", background: "var(--bg-elevated)",
                      transition: "border-color 0.15s",
                    }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)"}
                      onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                        background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14,
                      }}>
                        {t.category === "Food" ? "🍜" : t.category === "Transport" ? "🚗" : t.category === "Shopping" ? "🛍️" : t.category === "Entertainment" ? "🎮" : t.category === "Bills" ? "📱" : t.category === "Rent" ? "🏠" : t.category === "Health" ? "💊" : "📦"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 2 }}>
                          {t.note || t.category}
                        </p>
                        <span style={{
                          fontSize: 10, fontWeight: 600, color,
                          background: `${color}15`, padding: "1px 7px", borderRadius: 99,
                        }}>{t.category}</span>
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", flexShrink: 0 }}>
                        {currency}{t.amount.toLocaleString()}
                      </span>
                      {deleteId === t.id ? (
                        <button type="button" onClick={() => { onDelete(t.id); setDeleteId(null); }} style={{
                          padding: "4px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600,
                          cursor: "pointer", border: "none",
                          background: "var(--hard-bg)", color: "var(--hard)", flexShrink: 0,
                        }} onMouseLeave={() => setDeleteId(null)}>
                          Sure?
                        </button>
                      ) : (
                        <button type="button" onClick={() => setDeleteId(t.id)} style={{
                          padding: "4px 10px", borderRadius: 7, fontSize: 11,
                          cursor: "pointer", border: "1px solid var(--border)",
                          background: "transparent", color: "var(--text-muted)", flexShrink: 0,
                          transition: "all 0.15s",
                        }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--hard)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--hard-bg)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
                        >✕</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
