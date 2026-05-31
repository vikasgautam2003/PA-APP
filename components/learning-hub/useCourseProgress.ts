"use client";

import { useEffect, useState } from "react";
import { getDb } from "@/lib/db";
import { useAuthStore } from "@/store/authStore";
import { AIE_PHASES } from "@/lib/aie-roadmap";
import { AWS_DAYS } from "@/lib/aws-roadmap";
import { GHA_CHAPTERS } from "@/lib/gha-roadmap";
import { GIT_CHAPTERS } from "@/lib/git-roadmap";
import { isAiePhaseComplete } from "@/hooks/useAie";
import { isAwsDayComplete } from "@/hooks/useAws";
import { isGhaChapterComplete } from "@/hooks/useGha";
import { isGitChapterComplete } from "@/hooks/useGit";
import type {
  AieProgressRow,
  AiePhaseProgress,
  AwsProgressRow,
  AwsDayProgress,
  GhaProgressRow,
  GhaChapterProgress,
  GitProgressRow,
  GitChapterProgress,
} from "@/types";
import type { CourseId } from "./courses";

export interface CourseProgressSummary {
  id: CourseId;
  done: number;
  total: number;
  pct: number;
  currentUnit: number;
}

export function useAllCourseProgress(): {
  summaries: Record<CourseId, CourseProgressSummary>;
  isLoading: boolean;
} {
  const { user } = useAuthStore();
  const [summaries, setSummaries] = useState<Record<CourseId, CourseProgressSummary>>({
    "ai-engineer": zero("ai-engineer", AIE_PHASES.length),
    aws: zero("aws", AWS_DAYS.length),
    "github-actions": zero("github-actions", GHA_CHAPTERS.length),
    "git-github": zero("git-github", GIT_CHAPTERS.length),
  });
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const db = await getDb();

      const [aieRows, awsRows, ghaRows, gitRows] = await Promise.all([
        db.select<AieProgressRow[]>("SELECT * FROM ai_engineer_progress WHERE user_id = ?", [user.id]),
        db.select<AwsProgressRow[]>("SELECT * FROM aws_progress WHERE user_id = ?", [user.id]),
        db.select<GhaProgressRow[]>("SELECT * FROM gha_progress WHERE user_id = ?", [user.id]),
        db.select<GitProgressRow[]>("SELECT * FROM git_progress WHERE user_id = ?", [user.id]),
      ]);

      if (cancelled) return;

      const aieMap: Record<number, AiePhaseProgress> = {};
      for (const r of aieRows) {
        aieMap[r.phase_num] = {
          phase: r.phase_num,
          done: !!r.done,
          sectionIndex: r.section_index ?? 0,
          notes: r.notes ?? "",
          completedAt: r.completed_at,
        };
      }

      const awsMap: Record<number, AwsDayProgress> = {};
      for (const r of awsRows) {
        awsMap[r.day_number] = {
          day: r.day_number,
          taskDone: !!r.task_done,
          sectionIndex: r.section_index ?? 0,
          notes: r.notes ?? "",
          completedAt: r.completed_at,
        };
      }

      const ghaMap: Record<number, GhaChapterProgress> = {};
      for (const r of ghaRows) {
        ghaMap[r.chapter_num] = {
          chapter: r.chapter_num,
          done: !!r.done,
          sectionIndex: r.section_index ?? 0,
          notes: r.notes ?? "",
          completedAt: r.completed_at,
        };
      }

      const gitMap: Record<number, GitChapterProgress> = {};
      for (const r of gitRows) {
        gitMap[r.chapter_num] = {
          chapter: r.chapter_num,
          done: !!r.done,
          sectionIndex: r.section_index ?? 0,
          notes: r.notes ?? "",
          completedAt: r.completed_at,
        };
      }

      const aieDone = AIE_PHASES.filter((p) => isAiePhaseComplete(p.num, aieMap)).length;
      const awsDone = AWS_DAYS.filter((d) => isAwsDayComplete(d.day, awsMap)).length;
      const ghaDone = GHA_CHAPTERS.filter((c) => isGhaChapterComplete(c.num, ghaMap)).length;
      const gitDone = GIT_CHAPTERS.filter((c) => isGitChapterComplete(c.num, gitMap)).length;

      setSummaries({
        "ai-engineer": makeSummary("ai-engineer", aieDone, AIE_PHASES.length,
          firstIncomplete(AIE_PHASES.map((p) => p.num), (n) => isAiePhaseComplete(n, aieMap))),
        aws: makeSummary("aws", awsDone, AWS_DAYS.length,
          firstIncomplete(AWS_DAYS.map((d) => d.day), (n) => isAwsDayComplete(n, awsMap))),
        "github-actions": makeSummary("github-actions", ghaDone, GHA_CHAPTERS.length,
          firstIncomplete(GHA_CHAPTERS.map((c) => c.num), (n) => isGhaChapterComplete(n, ghaMap))),
        "git-github": makeSummary("git-github", gitDone, GIT_CHAPTERS.length,
          firstIncomplete(GIT_CHAPTERS.map((c) => c.num), (n) => isGitChapterComplete(n, gitMap))),
      });
      setLoading(false);
    })().catch((e) => {
      console.error("useAllCourseProgress failed", e);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [user]);

  return { summaries, isLoading };
}

function zero(id: CourseId, total: number): CourseProgressSummary {
  return { id, done: 0, total, pct: 0, currentUnit: 1 };
}

function makeSummary(id: CourseId, done: number, total: number, currentUnit: number): CourseProgressSummary {
  return { id, done, total, pct: Math.round((done / total) * 100), currentUnit };
}

function firstIncomplete(units: number[], isComplete: (n: number) => boolean): number {
  for (const n of units) {
    if (!isComplete(n)) return n;
  }
  return units[units.length - 1] ?? 1;
}
