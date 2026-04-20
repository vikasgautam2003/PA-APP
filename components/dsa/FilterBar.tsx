"use client";

import { useDSAStore } from "@/store/dsaStore";
import { cn } from "@/lib/utils";

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"] as const;
const STATUSES = ["All", "todo", "solving", "done"] as const;

const STATUS_LABELS: Record<string, string> = {
  All: "All",
  todo: "Todo",
  solving: "Solving",
  done: "Done",
};

const DIFF_COLORS: Record<string, string> = {
  All: "text-slate-300",
  Easy: "text-emerald-400",
  Medium: "text-amber-400",
  Hard: "text-red-400",
};

export default function FilterBar() {
  const {
    topics,
    selectedTopic,
    filterDifficulty,
    filterStatus,
    searchQuery,
    setSelectedTopic,
    setFilterDifficulty,
    setFilterStatus,
    setSearchQuery,
  } = useDSAStore();

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search questions..."
        className="w-full bg-[#1e1b4b]/40 border border-[#312e81] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
      />

      <div className="flex flex-wrap gap-3">
        {/* Topic */}
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="bg-[#1e1b4b]/40 border border-[#312e81] rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-violet-500 transition-colors"
        >
          {topics.map((t) => (
            <option key={t} value={t} className="bg-[#1e1b4b]">
              {t}
            </option>
          ))}
        </select>

        {/* Difficulty */}
        <div className="flex gap-1 bg-[#1e1b4b]/40 border border-[#312e81] rounded-lg p-1">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setFilterDifficulty(d)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-all",
                filterDifficulty === d
                  ? "bg-[#312e81] text-white"
                  : cn("hover:bg-white/5", DIFF_COLORS[d])
              )}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Status */}
        <div className="flex gap-1 bg-[#1e1b4b]/40 border border-[#312e81] rounded-lg p-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-all",
                filterStatus === s
                  ? "bg-[#312e81] text-white"
                  : "text-slate-400 hover:bg-white/5"
              )}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}