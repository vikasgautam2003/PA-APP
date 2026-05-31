"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PageWrapper from "@/components/layout/PageWrapper";
import CourseCard from "@/components/learning-hub/CourseCard";
import CourseModal from "@/components/learning-hub/CourseModal";
import { COURSES, type CourseId } from "@/components/learning-hub/courses";
import { useAllCourseProgress } from "@/components/learning-hub/useCourseProgress";

const VALID_IDS: CourseId[] = ["ai-engineer", "aws", "github-actions", "git-github"];

export default function LearningHubPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [openCourse, setOpenCourse] = useState<CourseId | null>(null);
  const { summaries, isLoading } = useAllCourseProgress();

  // Sync URL param → modal state (supports deep links + browser back/forward)
  useEffect(() => {
    const raw = params.get("course");
    if (raw && (VALID_IDS as string[]).includes(raw)) {
      setOpenCourse(raw as CourseId);
    } else {
      setOpenCourse(null);
    }
  }, [params]);

  const open = useCallback((id: CourseId) => {
    const url = new URL(window.location.href);
    url.searchParams.set("course", id);
    router.replace(url.pathname + url.search);
  }, [router]);

  const close = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("course");
    router.replace(url.pathname + (url.search ? url.search : ""));
  }, [router]);

  const totalDone = Object.values(summaries).reduce((a, s) => a + s.done, 0);
  const totalUnits = Object.values(summaries).reduce((a, s) => a + s.total, 0);
  const avgPct = Math.round(
    Object.values(summaries).reduce((a, s) => a + s.pct, 0) / COURSES.length
  );

  return (
    <PageWrapper
      title="Learning Hub"
      subtitle="4 courses · self-paced · everything you need to ship"
      action={
        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.18em",
            textTransform: "uppercase", color: "var(--text-faint)",
          }}>
            Overall · {totalDone} / {totalUnits} units
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{
              fontSize: 26, fontWeight: 700, letterSpacing: "-0.025em",
              fontVariantNumeric: "tabular-nums", lineHeight: 1,
              background: "linear-gradient(135deg, var(--accent), #7c3aed)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              {avgPct}
            </span>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>%</span>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          height: 400, color: "var(--text-faint)",
          fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
        }}>
          Loading
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 28,
          maxWidth: 1280,
          margin: "0 auto",
        }}>
          {COURSES.map((course, i) => (
            <CourseCard
              key={course.id}
              course={course}
              progress={summaries[course.id]}
              onOpen={() => open(course.id)}
              delayMs={i * 60}
            />
          ))}
        </div>
      )}

      {openCourse && (
        <CourseModal courseId={openCourse} onClose={close} />
      )}
    </PageWrapper>
  );
}
