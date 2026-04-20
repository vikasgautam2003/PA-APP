"use client";

import { useFinance } from "@/hooks/useFinance";
import PageWrapper from "@/components/layout/PageWrapper";
import CalculatorForm from "@/components/finance/CalculatorForm";
import SavingsChart from "@/components/finance/SavingsChart";
import ExpenseDonut from "@/components/finance/ExpenseDonut";
import FinanceChat from "@/components/finance/FinanceChat";

export default function FinancePage() {
  const {
    data, projection, breakdown, messages, isLoading, isChatLoading,
    save, sendMessage, clearChat,
  } = useFinance();

  return (
    <PageWrapper
      title="Financial Planner"
      subtitle="Track spending, project savings, get AI advice"
    >
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, height: "calc(100vh - 130px)" }}>

        {/* Left — Calculator */}
        <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
          <CalculatorForm data={data} onSave={save} />
        </div>

        {/* Right — Charts + Chat */}
        <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
          {projection && (
            <>
              <SavingsChart projection={projection} data={data} />
              <ExpenseDonut breakdown={breakdown} stipend={data.stipend} />
            </>
          )}

          {!projection && !isLoading && (
            <div style={{
              border: "1px solid var(--border)", borderRadius: 16,
              padding: "40px 24px", background: "var(--bg-elevated)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
            }}>
              <span style={{ fontSize: 36 }}>◉</span>
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
                Enter your finances
              </p>
              <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>
                Fill in your stipend and expenses on the left, then hit Save & Calculate
              </p>
            </div>
          )}

          {/* Chat — always visible */}
          <div style={{ minHeight: 420, flex: 1 }}>
            <FinanceChat
              messages={messages}
              isLoading={isChatLoading}
              onSend={sendMessage}
              onClear={clearChat}
            />
          </div>
        </div>
      </div>

      {/* Bounce animation for chat dots */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </PageWrapper>
  );
}