import { useEffect } from "react";
import { useCoursePlannerStore } from "@/store/coursePlannerStore";
import { useAuthStore } from "@/store/authStore";
import { getDb } from "@/lib/db";
import {
  activeCourses, courseDoneCount, getPlannerCourse, markCourseUnitDone,
} from "@/lib/courses-registry";
import {
  buildWeekPlan, getWeekStart, loadCoursePlan, saveCoursePlan, computeDayStatus,
} from "@/lib/course-plan";
import type { CourseWeekPlan } from "@/types";

export function useCoursePlanner() {
  const { user } = useAuthStore();
  const store = useCoursePlannerStore();

  useEffect(() => {
    if (user) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function load(): Promise<void> {
    store.setLoading(true);
    try {
      const db = await getDb();
      const active = await activeCourses(db, user!.id);
      store.setActive(active.map(({ course, done }) => ({
        course,
        done: courseDoneCount(course, done),
        total: course.units.length,
      })));
      store.setCurrentPlan(await loadCoursePlan(db, user!.id));
    } finally {
      store.setLoading(false);
    }
  }

  async function generateWeekPlan(): Promise<void> {
    store.setGenerating(true);
    try {
      const db = await getDb();
      const active = await activeCourses(db, user!.id);
      const plan = buildWeekPlan(active, getWeekStart());
      await saveCoursePlan(db, user!.id, plan);
      store.setCurrentPlan(plan);
    } finally {
      store.setGenerating(false);
    }
  }

  async function deleteWeekPlan(): Promise<void> {
    const db = await getDb();
    await db.execute(
      "DELETE FROM planner_course_plans WHERE user_id = ? AND week_start = ?",
      [user!.id, getWeekStart()]
    );
    store.setCurrentPlan(null);
  }

  async function markItemDone(date: string, courseId: string, unitNum: number): Promise<boolean> {
    const plan = store.currentPlan;
    if (!plan) return false;
    const day = plan.days.find((d) => d.date === date);
    const item = day?.items.find((i) => i.courseId === courseId && i.unitNum === unitNum);
    if (!item) return false;

    const nowDone = !item.is_done;
    const db = await getDb();

    // Write through to the course's own progress table so the hub + future plans agree.
    const course = getPlannerCourse(courseId as never);
    if (course) {
      try { await markCourseUnitDone(db, course, user!.id, unitNum, nowDone); } catch { /* best effort */ }
    }

    const updated: CourseWeekPlan = {
      ...plan,
      days: plan.days.map((d) => {
        if (d.date !== date) return d;
        const items = d.items.map((i) =>
          i.courseId === courseId && i.unitNum === unitNum ? { ...i, is_done: nowDone } : i
        );
        return { ...d, items, status: computeDayStatus(items) };
      }),
    };
    await saveCoursePlan(db, user!.id, updated);
    store.setCurrentPlan(updated);

    const dayNow = updated.days.find((d) => d.date === date);
    const complete = dayNow?.status === "green";
    if (complete) store.setCelebratingDay(date);
    return complete;
  }

  return {
    active: store.active,
    currentPlan: store.currentPlan,
    isLoading: store.isLoading,
    isGenerating: store.isGenerating,
    celebratingDay: store.celebratingDay,
    setCelebratingDay: store.setCelebratingDay,
    load,
    generateWeekPlan,
    deleteWeekPlan,
    markItemDone,
  };
}
