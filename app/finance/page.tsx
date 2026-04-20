"use client";

import { useFinance } from "@/hooks/useFinance";
import PageWrapper from "@/components/layout/PageWrapper";
import TabBar from "@/components/finance/TabBar";
import OverviewTab from "@/components/finance/OverviewTab";
import TransactionsTab from "@/components/finance/TransactionsTab";
import PredictionsTab from "@/components/finance/PredictionsTab";
import SettingsTab from "@/components/finance/SettingsTab";

export default function FinancePage() {
  const {
    activeTab, setActiveTab,
    data, projection, categorySummaries, transactions,
    snapshots, scenarios, messages, isChatLoading,
    saveSettings, addTransaction, deleteTransaction,
    sendMessage, clearChat,
  } = useFinance();

  return (
    <PageWrapper
      title="Financial Planner"
      subtitle="Track spending · predict savings · AI advice"
      action={
        <TabBar
          active={activeTab}
          onChange={setActiveTab}
          counts={{ transactions: transactions.length }}
        />
      }
    >
      {activeTab === "overview" && (
        <OverviewTab
          data={data}
          projection={projection}
          summaries={categorySummaries}
          onTabChange={setActiveTab}
        />
      )}

      {activeTab === "transactions" && (
        <TransactionsTab
          transactions={transactions}
          currency={data.currency ?? "₹"}
          onAdd={addTransaction}
          onDelete={deleteTransaction}
        />
      )}

      {activeTab === "predictions" && (
        <PredictionsTab
          scenarios={scenarios}
          snapshots={snapshots}
          data={data}
          messages={messages}
          isChatLoading={isChatLoading}
          onSend={sendMessage}
          onClear={clearChat}
        />
      )}

      {activeTab === "settings" && (
        <SettingsTab
          data={data}
          onSave={saveSettings}
        />
      )}
    </PageWrapper>
  );
}