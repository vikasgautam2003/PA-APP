"use client";

import { useMemo, useState } from "react";
import type { FinanceData, MonthlySnapshot } from "@/types";

interface YearStats {
  year: number;
  savedSoFar: number;
  savedFromSnapshots: number;
  currentMonthSavedEstimate: number;
  currentMonthSnapshotted: boolean;
  remaining: number;
  requiredMonthly: number;
  monthlyVariableBudget: number;
  dailyVariable: number;
  weeklyVariable: number;
  monthsRemaining: number;
  daysLeftInYear: number;
  progress: number;
  onPace: boolean;
}

interface Props {
  currency: string;
  data: FinanceData;
  yearStats: YearStats;
  snapshots: MonthlySnapshot[];
  onOpenSettings: () => void;
  onSaveSnapshot: (month: string, totalSpent: number, totalSaved: number) => Promise<void>;
  onDeleteSnapshot: (month: string) => Promise<void>;
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtMonth(key: string): string {
  const [y, m] = key.split("-");
  const idx = parseInt(m, 10) - 1;
  return `${MONTH_LABELS[idx] ?? m} ${y}`;
}

export default function SavingsTab({
  currency, data, yearStats, snapshots, onOpenSettings,
  onSaveSnapshot, onDeleteSnapshot,
}: Props) {
  const [editingMonth, setEditingMonth] = useState<string | null>(null);
  const [draftSpent, setDraftSpent]     = useState<string>("");
  const [draftSaved, setDraftSaved]     = useState<string>("");
  const [busy, setBusy]                 = useState(false);

  const yearSnapshots = useMemo(
    () => snapshots.filter((s) => s.month.startsWith(String(yearStats.year))),
    [snapshots, yearStats.year]
  );

  const todayKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const goalSet  = data.year_goal > 0;
  const overflow = yearStats.savedSoFar > data.year_goal && goalSet;

  function startEdit(month: string, snap?: MonthlySnapshot) {
    setEditingMonth(month);
    setDraftSpent(snap ? String(snap.total_spent) : "");
    setDraftSaved(snap
      ? String(snap.total_saved)
      : month === todayKey ? String(Math.max(0, Math.round(yearStats.currentMonthSavedEstimate))) : "");
  }

  async function commitEdit() {
    if (!editingMonth) return;
    setBusy(true);
    try {
      await onSaveSnapshot(editingMonth, parseFloat(draftSpent) || 0, parseFloat(draftSaved) || 0);
      setEditingMonth(null);
    } finally { setBusy(false); }
  }

  // Build the list of months for this year up to & including current month
  const today = new Date();
  const isCurrentYear = yearStats.year === today.getFullYear();
  const lastMonthIdx = isCurrentYear ? today.getMonth() : 11;
  const monthsToShow = Array.from({ length: lastMonthIdx + 1 }, (_, i) => {
    const key = `${yearStats.year}-${String(i + 1).padStart(2, "0")}`;
    return { key, label: MONTH_LABELS[i], snap: yearSnapshots.find((s) => s.month === key) };
  }).reverse();

  const card: React.CSSProperties = {
    borderRadius: 18, background: "var(--bg-elevated)",
    border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden",
  };
  const muted = "rgba(255,255,255,0.4)";
  const faint = "rgba(255,255,255,0.25)";

  if (!goalSet) {
    return (
      <div style={{ ...card, padding: "40px 28px", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#fff" }}>No year-end goal set</p>
        <p style={{ margin: "6px 0 18px", fontSize: 12, color: muted }}>
          Set a target — e.g. how much you want saved by Dec 31, {yearStats.year}.
        </p>
        <button
          onClick={onOpenSettings}
          style={{
            padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700,
            background: "#0a84ff", color: "#fff", border: "none", cursor: "pointer",
          }}
        >Set year-end goal →</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

      {/* ── Year goal hero ── */}
      <div style={{ ...card, padding: "28px 28px 24px", position: "relative" }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `radial-gradient(ellipse 60% 50% at 90% 40%, ${overflow ? "#4ade8014" : "#0a84ff12"} 0%, transparent 70%)`,
        }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#0a84ff" }}>
              {yearStats.year} GOAL
            </span>
            <span style={{ fontSize: 11, color: faint }}>· {yearStats.daysLeftInYear} days left</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 12, color: muted }}>Saved so far</p>
              <p style={{ margin: 0, fontSize: 48, fontWeight: 800, lineHeight: 0.95, letterSpacing: "-0.04em",
                          color: overflow ? "#4ade80" : "#fff", fontVariantNumeric: "tabular-nums" }}>
                {currency}{Math.round(yearStats.savedSoFar).toLocaleString()}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: "0 0 4px", fontSize: 11, color: faint }}>Target</p>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.7)", fontVariantNumeric: "tabular-nums" }}>
                {currency}{data.year_goal.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${Math.min(100, yearStats.progress * 100)}%`,
              background: overflow ? "#4ade80" : "linear-gradient(90deg, #0a84ff66, #0a84ff)",
              borderRadius: 99, transition: "width 0.7s cubic-bezier(.4,0,.2,1)",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: faint }}>
            <span>{Math.round(yearStats.progress * 100)}% complete</span>
            <span>{currency}{Math.max(0, Math.round(yearStats.remaining)).toLocaleString()} to go</span>
          </div>
        </div>
      </div>

      {/* ── Required pace + variable allowances ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ ...card, padding: "20px 22px" }}>
          <p style={{ margin: "0 0 12px", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: faint }}>
            Required savings
          </p>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: yearStats.onPace ? "#fff" : "#f87171", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
            {currency}{Math.round(yearStats.requiredMonthly).toLocaleString()}<span style={{ fontSize: 13, color: muted, fontWeight: 500 }}>/mo</span>
          </p>
          <p style={{ margin: "10px 0 0", fontSize: 11, color: faint }}>
            For {yearStats.monthsRemaining} more month{yearStats.monthsRemaining === 1 ? "" : "s"}
            {!yearStats.onPace && " · exceeds free cash"}
          </p>
        </div>
        <div style={{ ...card, padding: "20px 22px" }}>
          <p style={{ margin: "0 0 12px", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: faint }}>
            Spend cap (excl. rent)
          </p>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
            {currency}{Math.round(yearStats.monthlyVariableBudget).toLocaleString()}<span style={{ fontSize: 13, color: muted, fontWeight: 500 }}>/mo</span>
          </p>
          <p style={{ margin: "10px 0 0", fontSize: 11, color: faint }}>
            Stipend − rent − required savings
          </p>
        </div>
      </div>

      {/* Daily / weekly */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ ...card, padding: "18px 22px" }}>
          <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: faint }}>
            Daily allowance
          </p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
            {currency}{Math.round(yearStats.dailyVariable).toLocaleString()}<span style={{ fontSize: 12, color: muted, fontWeight: 500 }}>/day</span>
          </p>
        </div>
        <div style={{ ...card, padding: "18px 22px" }}>
          <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: faint }}>
            Weekly allowance
          </p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
            {currency}{Math.round(yearStats.weeklyVariable).toLocaleString()}<span style={{ fontSize: 12, color: muted, fontWeight: 500 }}>/week</span>
          </p>
        </div>
      </div>

      {/* ── Monthly savings log ── */}
      <div style={card}>
        <div style={{ padding: "18px 24px 14px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>
            Monthly savings · {yearStats.year}
          </p>
          <span style={{ fontSize: 10, color: faint, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Logged {currency}{Math.round(yearStats.savedFromSnapshots).toLocaleString()}
          </span>
        </div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

        {monthsToShow.map((m, i) => {
          const isEditing = editingMonth === m.key;
          const isCurrent = m.key === todayKey;
          const saved     = m.snap ? Number(m.snap.total_saved) : null;
          const spent     = m.snap ? Number(m.snap.total_spent) : null;

          return (
            <div key={m.key} style={{
              padding: "14px 24px", borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}>
              {!isEditing ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#fff" }}>
                      {m.label} {isCurrent && <span style={{ fontSize: 10, color: "#0a84ff", marginLeft: 6 }}>· this month</span>}
                    </p>
                    <p style={{ margin: "3px 0 0", fontSize: 11, color: faint }}>
                      {m.snap
                        ? <>Spent {currency}{Math.round(spent!).toLocaleString()} · Saved {currency}{Math.round(saved!).toLocaleString()}</>
                        : isCurrent
                          ? <>Estimate: {currency}{Math.round(yearStats.currentMonthSavedEstimate).toLocaleString()} (not snapshotted)</>
                          : "No snapshot"}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => startEdit(m.key, m.snap)}
                      style={{
                        padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                        background: "rgba(10,132,255,0.15)", color: "#0a84ff",
                        border: "none", cursor: "pointer",
                      }}
                    >{m.snap ? "Edit" : "Log"}</button>
                    {m.snap && (
                      <button
                        onClick={() => onDeleteSnapshot(m.key)}
                        style={{
                          padding: "6px 10px", borderRadius: 8, fontSize: 12,
                          background: "transparent", color: faint,
                          border: "none", cursor: "pointer",
                        }}
                        title="Delete snapshot"
                      >×</button>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#fff" }}>
                    {fmtMonth(m.key)}
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <label style={{ fontSize: 11, color: muted }}>
                      Total spent
                      <input
                        type="number" min="0" step="100"
                        value={draftSpent}
                        onChange={(e) => setDraftSpent(e.target.value)}
                        placeholder={`${currency}0`}
                        style={{
                          width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 8,
                          background: "var(--bg-base)", border: "1px solid var(--border)",
                          color: "#fff", fontSize: 13, fontVariantNumeric: "tabular-nums",
                          outline: "none",
                        }}
                      />
                    </label>
                    <label style={{ fontSize: 11, color: muted }}>
                      Saved
                      <input
                        type="number" min="0" step="100"
                        value={draftSaved}
                        onChange={(e) => setDraftSaved(e.target.value)}
                        placeholder={`${currency}0`}
                        style={{
                          width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 8,
                          background: "var(--bg-base)", border: "1px solid var(--border)",
                          color: "#fff", fontSize: 13, fontVariantNumeric: "tabular-nums",
                          outline: "none",
                        }}
                      />
                    </label>
                  </div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => setEditingMonth(null)}
                      disabled={busy}
                      style={{
                        padding: "7px 14px", borderRadius: 8, fontSize: 12,
                        background: "transparent", color: muted,
                        border: "1px solid var(--border)", cursor: "pointer",
                      }}
                    >Cancel</button>
                    <button
                      onClick={commitEdit}
                      disabled={busy}
                      style={{
                        padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                        background: "#0a84ff", color: "#fff",
                        border: "none", cursor: "pointer", opacity: busy ? 0.6 : 1,
                      }}
                    >{busy ? "Saving…" : "Save"}</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
