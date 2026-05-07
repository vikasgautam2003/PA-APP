"use client";

import { useEffect } from "react";
import { useDSA } from "@/hooks/useDSA";
import { useDSAStore, type MainTab } from "@/store/dsaStore";
import PageWrapper from "@/components/layout/PageWrapper";
import FilterBar from "@/components/dsa/FilterBar";
import QuestionCard from "@/components/dsa/QuestionCard";
import ProgressBar from "@/components/dsa/ProgressBar";
import TopicTags from "@/components/dsa/TopicTags";
import AllTopicsGrid from "@/components/dsa/AllTopicsGrid";
import CompanyView from "@/components/dsa/CompanyView";
import Heatmap from "@/components/dsa/Heatmap";
import TopicStrength from "@/components/dsa/TopicStrength";
import type { DSAQuestionWithProgress, QuestionNote } from "@/types";
import type { DSAStatus } from "@/types/dsa";

const TABS: { key: MainTab; label: string }[] = [
  { key: "overview",  label: "Overview"  },
  { key: "strength",  label: "Strength"  },
  { key: "topics",    label: "Topics"    },
  { key: "companies", label: "Companies" },
];

interface QListProps {
  isLoading: boolean;
  filtered: DSAQuestionWithProgress[];
  updateStatus: (questionId: number, status: DSAStatus) => Promise<void>;
  addNote: (questionId: number, content: string) => Promise<void>;
  getNotes: (questionId: number) => Promise<QuestionNote[]>;
  hint?: string;
}

function QuestionListSection({ isLoading, filtered, updateStatus, addNote, getNotes, hint }: QListProps) {
  if (isLoading) return (
    <div style={{ textAlign: "center", color: "var(--text-faint)", padding: "48px 0", fontSize: 13 }}>
      Loading questions…
    </div>
  );
  if (filtered.length === 0) return (
    <div style={{ textAlign: "center", padding: "48px 0" }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
        No questions match
      </p>
      <p style={{ fontSize: 12, color: "var(--text-faint)" }}>
        Try clearing your filters or selecting a different topic
      </p>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <p style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 4 }}>
        {hint ?? `Showing ${Math.min(filtered.length, 100)} of ${filtered.length} questions`}
      </p>
      {filtered.slice(0, 100).map((q) => (
        <QuestionCard
          key={q.id}
          question={q}
          onStatusChange={updateStatus}
          onAddNote={addNote}
          onGetNotes={getNotes}
        />
      ))}
      {filtered.length > 100 && (
        <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-faint)", padding: "10px 0" }}>
          Showing first 100 — use filters to narrow down
        </p>
      )}
    </div>
  );
}

export default function DSAPage() {
  const {
    filtered, questions,
    topicProgress, companyProgress, heatmap,
    totalDone,
    easySolved, easyTotal,
    medSolved, medTotal,
    hardSolved, hardTotal,
    isLoading,
    updateStatus, addNote, getNotes,
  } = useDSA();

  const {
    mainTab, setMainTab,
    selectedTopic, setSelectedTopic,
    selectedCompany, setSelectedCompany,
    setFilterDifficulty, setFilterStatus, setSearchQuery,
  } = useDSAStore();

  useEffect(() => {
    setFilterDifficulty("All");
    setFilterStatus("All");
    setSearchQuery("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const qListProps = { isLoading, filtered, updateStatus, addNote, getNotes };

  return (
    <PageWrapper
      title="DSA Tracker"
      subtitle={`${totalDone} / ${questions.length} solved`}
    >
      {/* ── Tab bar ── */}
      <div style={{
        display: "inline-flex", gap: 2,
        background: "var(--bg-elevated)",
        padding: 4, borderRadius: 12,
        border: "1px solid var(--border)",
        marginBottom: 24,
      }}>
        {TABS.map(({ key, label }) => {
          const on = mainTab === key;
          return (
            <button key={key} onClick={() => setMainTab(key)} style={{
              padding: "8px 22px", borderRadius: 9, fontSize: 13,
              fontWeight: on ? 600 : 400, cursor: "pointer", border: "none",
              background: on ? "var(--accent)" : "transparent",
              color: on ? "#fff" : "var(--text-muted)",
              boxShadow: on ? "0 0 12px var(--accent-glow)" : "none",
              transition: "all 0.15s",
            }}>
              {label}
            </button>
          );
        })}
      </div>

      {/* ══════════════ OVERVIEW ══════════════ */}
      {mainTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <ProgressBar
              totalDone={totalDone}   total={questions.length}
              easySolved={easySolved} easyTotal={easyTotal}
              medSolved={medSolved}   medTotal={medTotal}
              hardSolved={hardSolved} hardTotal={hardTotal}
            />
            <Heatmap heatmap={heatmap} />
          </div>
          <TopicTags topicProgress={topicProgress} selected={selectedTopic} onSelect={setSelectedTopic} />
          <FilterBar />
          <QuestionListSection
            {...qListProps}
            hint={selectedTopic !== "All" ? `${filtered.length} questions in "${selectedTopic}"` : undefined}
          />
        </div>
      )}

      {/* ══════════════ STRENGTH ══════════════ */}
      {mainTab === "strength" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <TopicStrength questions={questions} />
        </div>
      )}

      {/* ══════════════ TOPICS ══════════════ */}
      {mainTab === "topics" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <TopicTags topicProgress={topicProgress} selected={selectedTopic} onSelect={setSelectedTopic} />
          <div style={{ maxHeight: 320, overflowY: "auto", paddingRight: 4 }}>
            <AllTopicsGrid topicProgress={topicProgress} selected={selectedTopic} onSelect={setSelectedTopic} />
          </div>
          <div style={{ height: 1, background: "var(--border)" }} />
          <FilterBar />
          <QuestionListSection
            {...qListProps}
            hint={selectedTopic !== "All" ? `${filtered.length} questions in "${selectedTopic}"` : undefined}
          />
        </div>
      )}

      {/* ══════════════ COMPANIES ══════════════ */}
      {mainTab === "companies" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 12, color: "var(--text-faint)", margin: 0 }}>
            {selectedCompany !== "All"
              ? `${filtered.length} questions for ${selectedCompany} — click card to deselect`
              : `${companyProgress.length} companies — click any to filter questions below`}
          </p>
          <div style={{ maxHeight: 340, overflowY: "auto", paddingRight: 4 }}>
            <CompanyView companyProgress={companyProgress} selectedCompany={selectedCompany} onSelect={setSelectedCompany} />
          </div>
          <div style={{ height: 1, background: "var(--border)" }} />
          <FilterBar />
          <QuestionListSection {...qListProps} />
        </div>
      )}
    </PageWrapper>
  );
}
