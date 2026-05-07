"use client";

import { useFinance } from "@/hooks/useFinance";
import { useFinanceStore, type FinanceTab } from "@/store/financeStore";
import PageWrapper from "@/components/layout/PageWrapper";
import RealityCheck from "@/components/finance/RealityCheck";
import SavingsTab from "@/components/finance/SavingsTab";
import CrystalBall from "@/components/finance/CrystalBall";
import GuruChat from "@/components/finance/GuruChat";
import SettingsPanel from "@/components/finance/SettingsPanel";

const TABS: { key: FinanceTab; label: string }[] = [
  { key: "reality", label: "Reality Check" },
  { key: "savings", label: "Savings"       },
  { key: "crystal", label: "Crystal Ball"  },
  { key: "guru",    label: "Guru"           },
];

export default function FinancePage() {
  const finance = useFinance();
  const { activeTab, setActiveTab, settingsOpen, setSettingsOpen } = useFinanceStore();

  const {
    data, isLoading,
    categorySummaries, transactions, snapshots, scenarios,
    messages, isChatLoading,
    dailyBudget, todayAllowance, remainingToday, spentToday, rollover,
    totalSpentThisMonth, projectedMonthSpend, projectedMonthlySavings,
    daysInMonth, dayOfMonth, daysRemaining, monthlyFreeCash,
    effectiveMonthlySavings, savingsSource,
    yearStats,
    budgetWarnings, calcExpenseImpact,
    saveSettings, setPreferredSource,
    addTransaction, deleteTransaction,
    saveMonthlySnapshot, deleteMonthlySnapshot,
    sendMessage, clearChat,
  } = finance;

  const currency = data.currency ?? "₹";

  if (isLoading) {
    return (
      <PageWrapper title="Finance" subtitle="Loading…">
        <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
          Loading your finances…
        </div>
      </PageWrapper>
    );
  }

  return (
    <>
      {settingsOpen && (
        <SettingsPanel data={data} onSave={saveSettings} onClose={() => setSettingsOpen(false)} />
      )}

      <PageWrapper
        title="Finance"
        subtitle={data.stipend > 0
          ? `${currency}${data.stipend.toLocaleString()}/mo · ${daysRemaining}d remaining`
          : "Configure your budget to begin"}
        action={
          <button
            onClick={() => setSettingsOpen(true)}
            style={{
              padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 600,
              background: "var(--bg-elevated)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6, transition: "all 0.12s",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)";
              (e.currentTarget as HTMLElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)";
            }}
          >⚙ Settings</button>
        }
      >
        {/* ── Tab bar ── */}
        <div style={{
          display: "inline-flex", gap: 2,
          background: "var(--bg-elevated)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14, padding: 4, marginBottom: 20,
        }}>
          {TABS.map(({ key, label }) => {
            const on = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  padding: "8px 20px", borderRadius: 11, fontSize: 13,
                  fontWeight: on ? 700 : 400, cursor: "pointer", border: "none",
                  background: on ? "#0a84ff" : "transparent",
                  color: on ? "#fff" : "rgba(255,255,255,0.4)",
                  boxShadow: on ? "0 2px 14px rgba(10,132,255,0.45)" : "none",
                  transition: "all 0.15s",
                  letterSpacing: on ? "-0.01em" : "normal",
                }}
              >{label}</button>
            );
          })}
        </div>

        {/* ── No budget nudge ── */}
        {data.stipend === 0 && (
          <div style={{
            marginBottom: 14, padding: "14px 20px",
            background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.2)",
            borderRadius: 16, display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#fb923c" }}>Budget not configured</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Add income and limits to unlock all features</p>
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              style={{
                padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                background: "#fb923c", color: "#000", border: "none", cursor: "pointer",
              }}
            >Set up →</button>
          </div>
        )}

        {activeTab === "reality" && (
          <RealityCheck
            currency={currency}
            dailyBudget={dailyBudget}
            todayAllowance={todayAllowance}
            remainingToday={remainingToday}
            spentToday={spentToday}
            rollover={rollover}
            totalSpentThisMonth={totalSpentThisMonth}
            projectedMonthSpend={projectedMonthSpend}
            projectedMonthlySavings={projectedMonthlySavings}
            daysInMonth={daysInMonth}
            dayOfMonth={dayOfMonth}
            daysRemaining={daysRemaining}
            monthlyFreeCash={monthlyFreeCash}
            stipend={data.stipend}
            rent={data.rent}
            yearGoal={data.year_goal}
            monthlyTarget={data.monthly_savings_target}
            requiredMonthlySavings={yearStats.requiredMonthly}
            effectiveMonthlySavings={effectiveMonthlySavings}
            savingsSource={savingsSource}
            onOpenSettings={() => setSettingsOpen(true)}
            onSetSource={setPreferredSource}
            categorySummaries={categorySummaries}
            transactions={transactions}
            onAdd={addTransaction}
            onDelete={deleteTransaction}
          />
        )}

        {activeTab === "savings" && (
          <SavingsTab
            currency={currency}
            data={data}
            yearStats={yearStats}
            snapshots={snapshots}
            onOpenSettings={() => setSettingsOpen(true)}
            onSaveSnapshot={saveMonthlySnapshot}
            onDeleteSnapshot={deleteMonthlySnapshot}
          />
        )}

        {activeTab === "crystal" && (
          <CrystalBall
            currency={currency}
            data={data}
            scenarios={scenarios}
            categorySummaries={categorySummaries}
            budgetWarnings={budgetWarnings}
            calcExpenseImpact={calcExpenseImpact}
          />
        )}

        {activeTab === "guru" && (
          <GuruChat
            messages={messages}
            isChatLoading={isChatLoading}
            onSend={sendMessage}
            onClear={clearChat}
          />
        )}
      </PageWrapper>
    </>
  );
}
