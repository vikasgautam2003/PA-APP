import { cn } from "@/lib/utils";
import type { TopicProgress } from "@/types";

interface Props {
  topicProgress: TopicProgress[];
  totalDone: number;
  total: number;
}

export default function ProgressBar({ topicProgress, totalDone, total }: Props) {
  const percent = total > 0 ? Math.round((totalDone / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Overall */}
      <div className="bg-[#1e1b4b]/40 border border-[#312e81] rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-white">Overall Progress</span>
          <span className="text-sm text-violet-300 font-bold">
            {totalDone} / {total}
          </span>
        </div>
        <div className="w-full h-2 bg-[#312e81] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1.5">{percent}% complete</p>
      </div>

      {/* Per topic — show top 8 */}
      <div className="grid grid-cols-2 gap-2">
        {topicProgress.slice(0, 8).map((t) => {
          const pct = t.total > 0 ? Math.round((t.done / t.total) * 100) : 0;
          return (
            <div
              key={t.topic}
              className="bg-[#1e1b4b]/20 border border-[#312e81]/50 rounded-lg p-3"
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-slate-300 truncate max-w-[100px]">
                  {t.topic}
                </span>
                <span className="text-xs text-slate-500">
                  {t.done}/{t.total}
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#312e81] rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}