"use client";

// Real brand marks for each course. Each renders in `currentColor` so the
// CourseCard can choose to paint them brand-coloured (on the hub index) or
// app-accent (everywhere else).

export type CourseIconId = "ai-engineer" | "system-design" | "aws" | "git-github" | "github-actions";

interface IconProps {
  size?: number;
}

/**
 * AWS — the iconic smile/arrow underneath the "aws" wordmark.
 * Brand: orange (#FF9900) on dark navy (#232F3E).
 */
export function AwsLogo({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden>
      {/* "aws" lowercase wordmark — simplified geometric forms */}
      <g fill="currentColor">
        {/* 'a' */}
        <path d="M14 30 q4 -5 9 -5 q5 0 6 5 v12 h-4 v-2 q-2 3 -6 3 q-5 0 -5 -5 q0 -5 5 -6 l6 -1 v-1 q0 -3 -3 -3 q-3 0 -6 3 z M20 38 q-2 0 -2 2 q0 2 2 2 q2 0 4 -1 v-3 z" />
        {/* 'w' */}
        <path d="M31 26 l3 11 l3 -11 h4 l3 11 l3 -11 h4 l-5 16 h-4 l-3 -10 l-3 10 h-4 l-5 -16 z" />
        {/* 's' */}
        <path d="M55 30 q4 -5 9 -5 q5 0 6 4 l-3 1 q-1 -2 -3 -2 q-3 0 -3 2 q0 2 3 2 l2 1 q5 1 5 5 q0 5 -7 5 q-6 0 -8 -4 l3 -2 q1 2 5 2 q3 0 3 -2 q0 -1 -3 -2 l-2 0 q-5 -1 -5 -5 z" />
      </g>
      {/* The smile/arrow */}
      <path
        d="M12 56 q28 14 56 0"
        stroke="currentColor"
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M64 53 l7 3 l-4 6"
        stroke="currentColor"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * GitHub Octocat — the recognisable cat-silhouette mark.
 * Brand: dark navy (#0D1117 / #1F2328) with white mark.
 */
export function GitHubOctocat({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * AI Engineer — a neural node graph: a central "brain" node with connected
 * satellite nodes (tools / context / memory), suggesting an agentic AI system.
 * Renders in currentColor.
 */
export function AiEngineerMark({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden>
      {/* outer ring */}
      <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth={3} opacity={0.18} />
      {/* edges from centre to satellites */}
      <path d="M40 40 L22 22" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      <path d="M40 40 L58 22" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      <path d="M40 40 L20 52" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      <path d="M40 40 L60 52" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      {/* satellite nodes */}
      <circle cx="22" cy="22" r="5" stroke="currentColor" strokeWidth={3} fill="none" />
      <circle cx="58" cy="22" r="5" stroke="currentColor" strokeWidth={3} fill="none" />
      <circle cx="20" cy="52" r="5" stroke="currentColor" strokeWidth={3} fill="none" />
      <circle cx="60" cy="52" r="5" stroke="currentColor" strokeWidth={3} fill="none" />
      {/* central brain node */}
      <circle cx="40" cy="40" r="9" fill="currentColor" />
    </svg>
  );
}

/**
 * GitHub Actions — workflow node graph with a trigger play indicator.
 * Brand: dark navy (#0D1117) with success green (#3FB950) accent.
 */
export function GitHubActionsMark({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden>
      {/* Workflow nodes — left is the trigger (filled), centre is the matrix,
          right is the deploy gate (filled) */}
      <circle cx="18" cy="40" r="7" fill="currentColor" />
      <circle cx="40" cy="20" r="5.5" stroke="currentColor" strokeWidth={3} fill="none" />
      <circle cx="40" cy="60" r="5.5" stroke="currentColor" strokeWidth={3} fill="none" />
      <circle cx="62" cy="40" r="7" fill="currentColor" />

      {/* Edges connecting the workflow */}
      <path d="M24 36 L35 22" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      <path d="M24 44 L35 58" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      <path d="M45 22 L56 36" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      <path d="M45 58 L56 44" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />

      {/* Small play-arrow notch carved out of the trigger node — suggests
          "run pipeline" */}
      <path d="M15 36 L21 40 L15 44 Z" fill="#0D1117" />

      {/* Tiny check mark on the deploy node */}
      <path
        d="M58 40 L61 43 L66 37"
        stroke="#0D1117"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * System Design — stacked distributed-systems nodes: three server tiers
 * connected vertically, suggesting layered architecture / scale.
 * Renders in currentColor.
 */
export function SystemDesignMark({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden>
      {/* top tier — single client/LB node */}
      <rect x="34" y="12" width="12" height="12" rx="3" fill="currentColor" />
      {/* middle tier — two app server nodes */}
      <rect x="18" y="34" width="12" height="12" rx="3" stroke="currentColor" strokeWidth={3} fill="none" />
      <rect x="50" y="34" width="12" height="12" rx="3" stroke="currentColor" strokeWidth={3} fill="none" />
      {/* bottom tier — two data nodes */}
      <rect x="18" y="56" width="12" height="12" rx="3" fill="currentColor" />
      <rect x="50" y="56" width="12" height="12" rx="3" fill="currentColor" />
      {/* connecting edges */}
      <path d="M40 24 L24 34" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
      <path d="M40 24 L56 34" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
      <path d="M24 46 L24 56" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
      <path d="M56 46 L56 56" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
      <path d="M24 46 L56 56" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" opacity={0.5} />
    </svg>
  );
}

export function CourseIcon({ id, size }: { id: CourseIconId; size?: number }) {
  switch (id) {
    case "ai-engineer":
      return <AiEngineerMark size={size} />;
    case "system-design":
      return <SystemDesignMark size={size} />;
    case "aws":
      return <AwsLogo size={size} />;
    case "git-github":
      return <GitHubOctocat size={size} />;
    case "github-actions":
      return <GitHubActionsMark size={size} />;
  }
}
