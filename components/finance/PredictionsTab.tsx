"use client";

import { useState } from "react";
import type { ScenarioProjection, ChatMessage, FinanceData } from "@/types";
import FinanceChat from "./FinanceChat";

interface Props {
  scenarios: ScenarioProjection[];
  snapshots: any[];
  data: FinanceData;
  messages: ChatMessage[];
  isChatLoading: boolean;
  onSend: (text: string) => Promise<void>;
  onClear: () => void;
}

export default function PredictionsTab({ scenarios, snapshots, data, messages, isChatLoading, onSend, onClear }: Props) {
  const [affordCheck, setAffordCheck] = useState("");
  const [affordResult, setAffordResult] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const cur = data.currency ?? "₹";

  async function checkAfford() {
    if (!affordCheck.trim()) return;
    setChecking(true);
    const amount = parseFloat(affordCheck.replace(/[^0-9.]/g, ""));
    if (isNaN(amount)) {
      setAffordResult("Please enter a valid amount.");
      setChecking(false);
      return;
    }
    const pessimistic = scenarios[0]?.monthlySavings ?? 0;
    const realistic   = scenarios[1]?.monthlySavings ?? 0;
    if (pessimistic <= 0) {
      setAffordResult("You're currently spending more than you earn. Not recommended.");
    } else if (amount <= pessimistic) {
      setAffordResult(`✓ Yes — you can absorb ${cur}${amount.toLocaleString()} this month without impacting your goal.`);
    } else if (amount <= realistic) {
      setAffordResult(`⚠ Possible — but it'll push your goal back by ~${Math.ceil(amount / pessimistic)} week(s). Consider spreading it over 2 months.`);
    } else {
      const months = Math.ceil(amount / pessimistic);
      setAffordResult(`✕ Tight — ${cur}${amount.toLocaleString()} is ${months} month(s) of savings. Delay if possible, or cut ${cur}${Math.round((amount - pessimistic) / 4).toLocaleString()}/week from other expenses.`);
    }
    setChecking(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>
          Goal Scenarios
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {scenarios.map((s) => (
            <div key={s.label} style={{
              border: `1px solid ${s.color}30`,
              borderRadius: 14, padding: "18px 20px",
              background: `${s.color}08`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, boxShadow: `0 0 8px ${s.color}80` }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: s.color, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  {s.label}
                </span>
              </div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 14, lineHeight: 1.5 }}>{s.description}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 3 }}>Monthly savings</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: s.monthlySavings >= 0 ? "var(--text-primary)" : "var(--hard)", letterSpacing: "-0.03em" }}>
                    {s.monthlySavings < 0 ? "-" : ""}{cur}{Math.abs(Math.round(s.monthlySavings)).toLocaleString()}
                  </p>
                </div>
                {s.goalDate && (
                  <div>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 3 }}>Goal reached</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.goalDate}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.monthsToGoal} months away</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {snapshots.length > 0 && (
        <div style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "18px 22px", background: "var(--bg-elevated)" }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>
            Monthly History
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {snapshots.map((snap) => {
              const maxVal = Math.max(...snapshots.map((s) => s.total_spent));
              const pct = maxVal > 0 ? Math.round((snap.total_spent / maxVal) * 100) : 0;
              return (
                <div key={snap.month} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", width: 52, flexShrink: 0 }}>{snap.month}</span>
                  <div style={{ flex: 1, height: 6, background: "var(--border)", borderRadius: 99 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "var(--accent)", borderRadius: 99 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", width: 80, textAlign: "right", flexShrink: 0 }}>
                    {cur}{snap.total_spent.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 11, color: snap.total_saved >= 0 ? "var(--easy)" : "var(--hard)", width: 70, textAlign: "right", flexShrink: 0 }}>
                    +{cur}{snap.total_saved.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "18px 22px", background: "var(--bg-elevated)" }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>
          Can I Afford This?
        </h3>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--text-muted)" }}>{cur}</span>
            <input
              value={affordCheck}
              onChange={(e) => { setAffordCheck(e.target.value); setAffordResult(null); }}
              onKeyDown={(e) => e.key === "Enter" && checkAfford()}
              placeholder="Enter amount..."
              style={{
                width: "100%", padding: "10px 14px 10px 28px", borderRadius: 10,
                border: "1px solid var(--border)", fontSize: 13,
                color: "var(--text-primary)", background: "var(--bg-surface)", outline: "none",
              }}
              onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
            />
          </div>
          <button type="button" onClick={checkAfford} disabled={checking} style={{
            padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            cursor: "pointer", border: "none",
            background: "var(--accent)", color: "#fff",
            boxShadow: "0 0 12px var(--accent-glow)",
          }}>Check</button>
        </div>
        {affordResult && (
          <div style={{
            marginTop: 12, padding: "12px 16px", borderRadius: 10,
            background: "var(--bg-hover)", border: "1px solid var(--border)",
            fontSize: 13, color: "var(--text-primary)", lineHeight: 1.6,
          }}>
            {affordResult}
          </div>
        )}
      </div>

      <div style={{ height: 480 }}>
        <FinanceChat
          messages={messages}
          isLoading={isChatLoading}
          onSend={onSend}
          onClear={onClear}
        />
      </div>
    </div>
  );
}
