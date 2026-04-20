"use client";

import { usePlanner } from "@/hooks/usePlanner";
import { usePlannerStore } from "@/store/plannerStore";
import PageWrapper from "@/components/layout/PageWrapper";
import WeekPlanTab from "@/components/planner/WeekPlanTab";
import TopicsTab from "@/components/planner/TopicsTab";
import CalendarTab from "@/components/planner/CalendarTab";
import CelebrationOverlay from "@/components/planner/CelebrationOverlay";

type Tab = "plan" | "topics" | "calendar";

const TABS: { id: Tab; label: string }[] = [
  { id: "plan",     label: "Week Plan" },
  { id: "topics",   label: "Topics"   },
  { id: "calendar", label: "Calendar" },
];

export default function PlannerPage() {
  const {
    activeTab, setActiveTab, currentPlan, topics,
    isLoading, isGenerating, celebratingDay, setCelebratingDay,
    generateWeekPlan, addTopic, deleteTopic,
    deleteWeekPlan, improvePlan, markItemDone,
  } = usePlanner();

  return (
    <>
      <PageWrapper
        title="Weekly Planner"
        subtitle="AI-powered study planning · tracks your progress"
        action={
          <div style={{ display: "flex", gap: 2, background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 12, padding: 4 }}>
            {TABS.map(({ id, label }) => (
              <button key={id} onClick={() => setActiveTab(id)} style={{
                padding: "7px 18px", borderRadius: 9, fontSize: 13,
                fontWeight: activeTab === id ? 600 : 400, cursor: "pointer", border: "none",
                background: activeTab === id ? "var(--accent)" : "transparent",
                color: activeTab === id ? "#fff" : "var(--text-muted)",
                boxShadow: activeTab === id ? "0 0 12px var(--accent-glow)" : "none",
                transition: "all 0.15s",
              }}>{label}</button>
            ))}
          </div>
        }
      >
        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "var(--text-muted)", fontSize: 13 }}>
            Loading planner…
          </div>
        ) : (
          <>
            {activeTab === "plan" && (
              <WeekPlanTab
                plan={currentPlan}
                isGenerating={isGenerating}
                onGenerate={generateWeekPlan}
                onDelete={deleteWeekPlan}
                onImprovise={improvePlan}
                onMarkDone={markItemDone}
              />
            )}
            {activeTab === "topics" && (
              <TopicsTab
                topics={topics}
                onAdd={addTopic}
                onDelete={deleteTopic}
              />
            )}
            {activeTab === "calendar" && (
              <CalendarTab plan={currentPlan} />
            )}
          </>
        )}
      </PageWrapper>

      {celebratingDay && (
        <CelebrationOverlay onDone={() => setCelebratingDay(null)} />
      )}
    </>
  );
}
