"use client";

import { cn } from "@/lib/utils";
import type { DSAQuestionWithProgress } from "@/types";

interface Props {
  question: DSAQuestionWithProgress;
  onStatusChange: (id: number, status: "todo" | "solving" | "done") => void;
}

const DIFF_STYLES: Record<string, string> = {
  Easy:   "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  Hard:   "text-red-400 bg-red-400/10 border-red-400/20",
};

const STATUS_CYCLE: Record<string, "todo" | "solving" | "done"> = {
  todo:    "solving",
  solving: "done",
  done:    "todo",
};

const STATUS_STYLES: Record<string, string> = {
  todo:    "border-slate-700 bg-transparent",
  solving: "border-amber-500 bg-amber-500/10",
  done:    "border-emerald-500 bg-emerald-500/20",
};

const STATUS_ICON: Record<string, string> = {
  todo:    "",
  solving: "◑",
  done:    "✓",
};

export default function QuestionCard({ question, onStatusChange }: Props) {
  const { id, title, topic, difficulty, link, status } = question;

  return (
    <div
      className={cn(
        "flex items-center gap-4 px-4 py-3 rounded-xl border transition-all group",
        "bg-[#1e1b4b]/20 hover:bg-[#1e1b4b]/40",
        status === "done"
          ? "border-emerald-500/20"
          : "border-[#312e81]/50 hover:border-violet-500/30"
      )}
    >
      {/* Status toggle */}
      <button
        onClick={() => onStatusChange(id, STATUS_CYCLE[status])}
        className={cn(
          "w-6 h-6 rounded-md border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-all",
          STATUS_STYLES[status],
          status === "done" ? "text-emerald-400" : "text-amber-400"
        )}
        title={`Mark as ${STATUS_CYCLE[status]}`}
      >
        {STATUS_ICON[status]}
      </button>

      {/* Day number */}
      <span className="text-xs text-slate-600 w-10 shrink-0 font-mono">
        #{id}
      </span>

      {/* Title */}
      <span
        className={cn(
          "flex-1 text-sm font-medium truncate",
          status === "done" ? "text-slate-500 line-through" : "text-slate-200"
        )}
      >
        {title}
      </span>

      {/* Topic chip */}
      <span className="hidden md:block text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full shrink-0 max-w-[120px] truncate">
        {topic}
      </span>

      {/* Difficulty */}
      <span
        className={cn(
          "text-xs px-2 py-0.5 rounded-full border shrink-0",
          DIFF_STYLES[difficulty]
        )}
      >
        {difficulty}
      </span>

      {/* Link */}
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => e.stopPropagation()}
          className="text-slate-600 hover:text-violet-400 transition-colors shrink-0 text-sm"
          title="Open on LeetCode"
        >
          ↗
        </a>
      )}
    </div>
  );
}