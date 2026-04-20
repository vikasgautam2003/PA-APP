"use client";

import { useDSA } from "@/hooks/useDSA";
import PageWrapper from "@/components/layout/PageWrapper";
import FilterBar from "@/components/dsa/FilterBar";
import QuestionCard from "@/components/dsa/QuestionCard";
import ProgressBar from "@/components/dsa/ProgressBar";
import Heatmap from "@/components/dsa/Heatmap";

export default function DSAPage() {
  const {
    filtered,
    questions,
    topicProgress,
    heatmap,
    totalDone,
    isLoading,
    updateStatus,
  } = useDSA();

  return (
    <PageWrapper
      title="DSA Tracker"
      subtitle={`${totalDone} / ${questions.length} solved`}
    >
      <div className="flex flex-col gap-6">
        {/* Progress + Heatmap */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <ProgressBar
            topicProgress={topicProgress}
            totalDone={totalDone}
            total={questions.length}
          />
          <Heatmap heatmap={heatmap} />
        </div>

        {/* Filters */}
        <FilterBar />

        {/* Count */}
        <div className="text-xs text-slate-500">
          Showing {filtered.length} of {questions.length} questions
        </div>

        {/* Questions */}
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
            Loading questions...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
            No questions match your filters
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.slice(0, 100).map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                onStatusChange={updateStatus}
              />
            ))}
            {filtered.length > 100 && (
              <p className="text-center text-xs text-slate-600 py-4">
                Showing first 100 — use filters to narrow down
              </p>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
