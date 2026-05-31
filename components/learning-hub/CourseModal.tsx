"use client";

import { useEffect } from "react";
import { CourseIcon } from "./icons";
import { getCourse, type CourseId } from "./courses";
import AiEngineerShell from "./shells/AiEngineerShell";
import AwsShell from "./shells/AwsShell";
import GitShell from "./shells/GitShell";
import GhaShell from "./shells/GhaShell";

interface Props {
  courseId: CourseId;
  onClose: () => void;
}

export default function CourseModal({ courseId, onClose }: Props) {
  const course = getCourse(courseId);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!course) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0, 0, 0, 0.72)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        animation: "fde-fade-in 0.22s ease",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`course-theme-${courseId}`}
        style={{
          width: "min(1440px, 96vw)",
          height: "96vh",
          borderRadius: 22,
          background: "var(--bg-base)",
          border: "1px solid var(--border)",
          overflow: "hidden",
          display: "grid",
          gridTemplateRows: "auto 1fr",
          boxShadow: "0 40px 120px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--accent-glow)",
          animation: "fde-overlay-in 0.42s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Modal header — uses brand colours */}
        <header style={{
          padding: "18px 26px",
          borderBottom: "1px solid var(--border)",
          background: `
            linear-gradient(
              135deg,
              var(--course-brand-bg, var(--bg-elevated)) 0%,
              var(--course-brand-bg-2, var(--bg-elevated)) 100%
            )
          `,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Brand accent strip on top */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: `linear-gradient(90deg, var(--course-brand), transparent 70%)`,
          }} />

          <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 48, height: 48, borderRadius: 12,
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "var(--course-brand, var(--accent))",
              flexShrink: 0,
              boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
            }}>
              <CourseIcon id={course.id} size={30} />
            </span>
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontSize: 9, fontWeight: 700, letterSpacing: "0.22em",
                color: "var(--course-brand)",
                textTransform: "uppercase",
                marginBottom: 3,
                opacity: 0.95,
              }}>
                {course.tagline}
              </p>
              <h2 style={{
                fontSize: 18, fontWeight: 700,
                color: "#fff",
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {course.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            title="Close (Esc)"
            aria-label="Close"
            style={{
              width: 38, height: 38, borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              fontSize: 16, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.18s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,80,80,0.20)";
              e.currentTarget.style.borderColor = "var(--hard)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
            }}
          >
            ✕
          </button>
        </header>

        <div style={{
          overflowY: "auto",
          padding: "28px 32px 40px",
          background: "var(--bg-base)",
        }}>
          {courseId === "ai-engineer" && <AiEngineerShell />}
          {courseId === "aws" && <AwsShell />}
          {courseId === "github-actions" && <GhaShell />}
          {courseId === "git-github" && <GitShell />}
        </div>
      </div>
    </div>
  );
}
