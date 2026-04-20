import type { HeatmapEntry } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  heatmap: HeatmapEntry[];
}

function getLast365Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function getIntensity(count: number): string {
  if (count === 0) return "bg-[#1e1b4b]/40";
  if (count === 1) return "bg-violet-900";
  if (count === 2) return "bg-violet-700";
  if (count <= 4) return "bg-violet-500";
  return "bg-violet-400";
}

export default function Heatmap({ heatmap }: Props) {
  const days = getLast365Days();
  const countMap = new Map(heatmap.map((h) => [h.date, h.count]));

  // Group into weeks
  const weeks: string[][] = [];
  let week: string[] = [];
  days.forEach((day, i) => {
    week.push(day);
    if (week.length === 7 || i === days.length - 1) {
      weeks.push(week);
      week = [];
    }
  });

  const totalActive = heatmap.reduce((sum, h) => sum + h.count, 0);
  const activeDays = heatmap.length;

  return (
    <div className="bg-[#1e1b4b]/40 border border-[#312e81] rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-white">Activity</span>
        <span className="text-xs text-slate-500">
          {totalActive} solved across {activeDays} days
        </span>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => {
              const count = countMap.get(day) ?? 0;
              return (
                <div
                  key={day}
                  title={`${day}: ${count} solved`}
                  className={cn(
                    "w-3 h-3 rounded-sm transition-colors",
                    getIntensity(count)
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-2 justify-end">
        <span className="text-xs text-slate-600">Less</span>
        {["bg-[#1e1b4b]/40", "bg-violet-900", "bg-violet-700", "bg-violet-500", "bg-violet-400"].map((c) => (
          <div key={c} className={cn("w-3 h-3 rounded-sm", c)} />
        ))}
        <span className="text-xs text-slate-600">More</span>
      </div>
    </div>
  );
}