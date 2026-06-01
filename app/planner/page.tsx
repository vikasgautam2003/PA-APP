"use client";

import { useCoursePlanner } from "@/hooks/useCoursePlanner";
import PageWrapper from "@/components/layout/PageWrapper";
import TaskCheckbox from "@/components/planner/TaskCheckbox";
import CelebrationOverlay from "@/components/planner/CelebrationOverlay";
import type { CourseId } from "@/components/learning-hub/courses";

const COURSE_BRAND: Record<string, string> = {
  "aws": "#FF9900",
  "system-design": "#06B6D4",
  "ai-engineer": "#A855F7",
  "github-actions": "#3FB950",
  "git-github": "#2188FF",
};

const STATUS_COLOR: Record<string, string> = {
  green: "var(--easy)",
  amber: "#d97706",
  red: "#dc2626",
  pending: "var(--text-faint)",
  rest: "var(--text-faint)",
};

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function PlannerPage() {
  const {
    active, currentPlan, isLoading, isGenerating, celebratingDay, setCelebratingDay,
    generateWeekPlan, deleteWeekPlan, markItemDone,
  } = useCoursePlanner();

  const today = todayStr();

  return (
    <>
      <PageWrapper
        title="Course Planner"
        subtitle="Two courses at a time · the week, planned around what's left"
        action={
          currentPlan ? (
            <button
              onClick={() => void deleteWeekPlan()}
              style={ghostBtn}
            >
              Clear plan
            </button>
          ) : null
        }
      >
        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "var(--text-muted)", fontSize: 13 }}>
            Loading planner…
          </div>
        ) : (
          <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>

            {/* Active courses */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {active.map(({ course, done, total }) => {
                const pct = Math.round((done / total) * 100);
                const brand = COURSE_BRAND[course.id] ?? "var(--accent)";
                return (
                  <div key={course.id} style={{
                    flex: "1 1 260px",
                    border: "1px solid var(--border)", borderRadius: 16,
                    background: "var(--bg-elevated)", padding: "18px 20px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <span style={{
                        width: 10, height: 10, borderRadius: 3, background: brand, flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{course.label}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                        {done} / {total} {course.unitNoun}s
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: brand, fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 99, background: "var(--border-subtle)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: brand, borderRadius: 99, transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Generate / regenerate */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={() => void generateWeekPlan()}
                disabled={isGenerating}
                style={{
                  padding: "10px 20px", borderRadius: 999, border: "none",
                  background: "linear-gradient(135deg, var(--accent), #7c3aed)",
                  color: "#fff", fontSize: 12.5, fontWeight: 700, letterSpacing: "0.04em",
                  cursor: isGenerating ? "wait" : "pointer",
                  boxShadow: "0 6px 20px var(--accent-glow)",
                  opacity: isGenerating ? 0.7 : 1,
                  transition: "all 0.2s",
                }}
              >
                {isGenerating ? "Planning…" : currentPlan ? "Regenerate this week" : "Plan my week"}
              </button>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                One unit from each course, Mon–Sat · Sunday rests
              </span>
            </div>

            {/* Week grid */}
            {!currentPlan ? (
              <div style={{
                border: "1px dashed var(--border)", borderRadius: 16,
                padding: "48px 24px", textAlign: "center",
                background: "var(--bg-elevated)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              }}>
                <span style={{ fontSize: 34 }}>🗓️</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>No plan yet for this week</p>
                <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 420 }}>
                  Hit <b>Plan my week</b> and I&apos;ll lay out the next units of your two active courses across the week.
                </p>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 14,
              }}>
                {currentPlan.days.map((d) => {
                  const isToday = d.date === today;
                  const statusColor = STATUS_COLOR[d.status] ?? "var(--text-faint)";
                  return (
                    <div key={d.date} style={{
                      border: `1px solid ${isToday ? "var(--accent)" : "var(--border)"}`,
                      borderRadius: 14,
                      background: "var(--bg-elevated)",
                      boxShadow: isToday ? "0 0 0 3px var(--accent-glow)" : "none",
                      overflow: "hidden",
                      display: "flex", flexDirection: "column",
                    }}>
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "10px 14px", borderBottom: "1px solid var(--border-subtle)",
                      }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
                          {d.day}{isToday ? " · Today" : ""}
                        </span>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor }} />
                      </div>

                      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                        {d.status === "rest" ? (
                          <p style={{ fontSize: 12, color: "var(--text-faint)", textAlign: "center", padding: "16px 0" }}>
                            🌿 Rest
                          </p>
                        ) : d.items.length === 0 ? (
                          <p style={{ fontSize: 12, color: "var(--text-faint)", textAlign: "center", padding: "16px 0" }}>
                            Courses complete
                          </p>
                        ) : (
                          d.items.map((item) => {
                            const brand = COURSE_BRAND[item.courseId] ?? "var(--accent)";
                            return (
                              <div key={`${item.courseId}-${item.unitNum}`} style={{
                                display: "flex", gap: 10, alignItems: "flex-start",
                                opacity: item.is_done ? 0.55 : 1,
                              }}>
                                <TaskCheckbox
                                  done={item.is_done}
                                  onCheck={() => markItemDone(d.date, item.courseId, item.unitNum).then(() => {})}
                                />
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <span style={{
                                    display: "inline-block",
                                    fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                                    color: brand, marginBottom: 3,
                                  }}>
                                    {item.short}
                                  </span>
                                  <p style={{
                                    fontSize: 12.5, lineHeight: 1.4,
                                    color: "var(--text-primary)",
                                    textDecoration: item.is_done ? "line-through" : "none",
                                  }}>
                                    {item.label}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </PageWrapper>

      {celebratingDay && <CelebrationOverlay onDone={() => setCelebratingDay(null)} />}
    </>
  );
}

const ghostBtn: React.CSSProperties = {
  padding: "8px 16px", borderRadius: 999,
  border: "1px solid var(--border)", background: "transparent",
  fontSize: 12, fontWeight: 600, color: "var(--text-muted)",
  cursor: "pointer", transition: "all 0.18s",
};
