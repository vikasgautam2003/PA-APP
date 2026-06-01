import type { CourseId } from "@/components/learning-hub/courses";

export interface CoursePlanItem {
  courseId: CourseId;
  short: string;       // course short name, e.g. "AWS"
  unitNum: number;     // unit id within the course
  label: string;       // unit label
  is_done: boolean;
}

export interface CourseDayPlan {
  date: string;        // YYYY-MM-DD
  day: string;         // Mon, Tue, …
  items: CoursePlanItem[];
  status: "pending" | "green" | "amber" | "red" | "rest";
}

export interface CourseWeekPlan {
  week_start: string;
  course_ids: CourseId[];   // the two active courses this plan covers
  days: CourseDayPlan[];
  generated_at: string;
}
