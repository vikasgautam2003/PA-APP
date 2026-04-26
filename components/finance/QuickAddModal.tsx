"use client";

import { useState } from "react";
import { CATEGORIES, CATEGORY_COLORS } from "@/hooks/useFinance";
import type { TransactionFormData, TransactionCategory } from "@/types";

interface Props {
  currency: string;
  onAdd: (form: TransactionFormData) => Promise<void>;
  onClose: () => void;
}

export default function QuickAddModal({ currency, onAdd, onClose }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [amount,   setAmount]   = useState("");
  const [category, setCategory] = useState<TransactionCategory>("Food");
  const [note,     setNote]     = useState("");
  const [date,     setDate]     = useState(today);
  const [saving,   setSaving]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    setSaving(true);
    try { await onAdd({ amount: amt, category, note, date }); onClose(); }
    finally { setSaving(false); }
  }

  const col = CATEGORY_COLORS[category];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        style={{
          width: 400, background: "#0E0C09",
          border: "1px solid rgba(255,255,255,0.10)", borderRadius: 22,
          overflow: "hidden",
          boxShadow: "0 40px 100px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.05)",
        }}
      >
        {/* Amount hero */}
        <div style={{
          padding: "28px 28px 24px",
          background: `linear-gradient(135deg, ${col}12 0%, transparent 60%)`,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          position: "relative",
        }}>
          <div style={{
            position: "absolute", top: 0, right: 0, bottom: 0,
            width: "50%", background: `radial-gradient(ellipse at 80% 50%, ${col}10 0%, transparent 70%)`,
            pointerEvents: "none",
          }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Log expense</p>
            <button type="button" onClick={onClose} style={{
              background: "rgba(255,255,255,0.07)", border: "none", borderRadius: "50%",
              color: "rgba(255,255,255,0.4)", cursor: "pointer",
              width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            }}>×</button>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
            <span style={{ fontSize: 32, color: "rgba(255,255,255,0.25)", fontWeight: 300, paddingBottom: 4 }}>{currency}</span>
            <input
              autoFocus
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                fontSize: 56, fontWeight: 800, color: amount ? col : "rgba(255,255,255,0.2)",
                letterSpacing: "-0.05em", fontVariantNumeric: "tabular-nums",
                textShadow: amount ? `0 0 30px ${col}44` : "none",
                transition: "color 0.2s, text-shadow 0.2s",
              }}
            />
          </div>
        </div>

        {/* Category */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Category</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {CATEGORIES.map((c) => {
              const on  = category === c;
              const cc  = CATEGORY_COLORS[c];
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  style={{
                    padding: "7px 15px", borderRadius: 99, fontSize: 12, fontWeight: on ? 600 : 400,
                    cursor: "pointer", transition: "all 0.12s",
                    border: `1px solid ${on ? cc : "rgba(255,255,255,0.1)"}`,
                    background: on ? `${cc}20` : "rgba(255,255,255,0.04)",
                    color: on ? cc : "rgba(255,255,255,0.45)",
                    boxShadow: on ? `0 0 10px ${cc}30` : "none",
                  }}
                >{c}</button>
              );
            })}
          </div>
        </div>

        {/* Note + Date */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ padding: "14px 24px" }}>
            <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>Note</p>
            <input
              type="text"
              placeholder="What was it for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box", background: "none", border: "none",
                outline: "none", fontSize: 13, color: "rgba(255,255,255,0.8)",
              }}
            />
          </div>
          <div style={{ background: "rgba(255,255,255,0.06)" }} />
          <div style={{ padding: "14px 24px" }}>
            <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>Date</p>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                background: "none", border: "none", outline: "none",
                fontSize: 13, color: "rgba(255,255,255,0.8)", cursor: "pointer", padding: 0,
              }}
            />
          </div>
        </div>

        {/* Submit */}
        <div style={{ padding: "18px 24px" }}>
          <button
            type="submit"
            disabled={saving || !amount}
            style={{
              width: "100%", padding: "14px 0", borderRadius: 14,
              fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer",
              background: amount ? col : "rgba(255,255,255,0.08)",
              color: amount ? (col === "#6b7280" ? "#fff" : "#000") : "rgba(255,255,255,0.3)",
              boxShadow: amount ? `0 4px 24px ${col}55` : "none",
              transition: "all 0.2s",
              letterSpacing: "-0.01em",
            }}
          >{saving ? "Saving…" : "Add expense"}</button>
        </div>
      </form>
    </div>
  );
}
