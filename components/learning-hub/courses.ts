import type { CourseIconId } from "./icons";

export type CourseId = CourseIconId;

export interface CourseMeta {
  id: CourseId;
  title: string;
  tagline: string;
  description: string;
  units: number;
  unitsLabel: string;
  durationLabel: string;
  standaloneRoute: string;
  /** Optional hero photo (16:9 ideally). Lives in /public/courses/.
      If absent or fails to load, the card falls back to the SVG mark. */
  heroImage?: string;
}

export const COURSES: CourseMeta[] = [
  {
    id: "ai-engineer",
    title: "AI Engineer Master Roadmap",
    tagline: "Zero → production AI · RAG + Agents + Evals",
    description:
      "12 phases from dev setup to LLMs, RAG, agentic systems, evals, fine-tuning, system design, and deployment. 12 mini-projects + 1 capstone.",
    units: 12,
    unitsLabel: "phases",
    durationLabel: "self-paced",
    standaloneRoute: "/ai-engineer",
  },
  {
    id: "system-design",
    title: "System Design Master Roadmap",
    tagline: "Crack every interview · basics → billion-scale",
    description:
      "15 chapters: networking, databases, caching, queues, distributed systems, real-world designs (Twitter, Uber, YouTube) + the interview framework.",
    units: 15,
    unitsLabel: "chapters",
    durationLabel: "self-paced",
    standaloneRoute: "/system-design",
  },
  {
    id: "aws",
    title: "AWS Solutions Architect",
    tagline: "SAA-C03 + production skills",
    description:
      "90 days from IAM to multi-region DR. 7 phases. 4 capstones. Built around the SAA-C03 blueprint.",
    units: 90,
    unitsLabel: "days",
    durationLabel: "~3 months",
    standaloneRoute: "/aws",
    heroImage: "/courses/aws.jpg",
  },
  {
    id: "github-actions",
    title: "GitHub Actions — Expert Pipelines",
    tagline: "Production YAML only, no fluff",
    description:
      "Triggers, jobs, OIDC, caching, reusable workflows, Docker pipelines, full CI/CD. 8 mini-projects + capstone.",
    units: 9,
    unitsLabel: "chapters",
    durationLabel: "~2 weeks",
    standaloneRoute: "/github-actions",
    heroImage: "/courses/github-actions.webp",
  },
  {
    id: "git-github",
    title: "Git & GitHub — Company Ready",
    tagline: "From day one to senior contributor",
    description:
      "Branching, commits, PRs, conflicts, code review, issues, advanced recovery. The unwritten rules that build trust.",
    units: 10,
    unitsLabel: "chapters",
    durationLabel: "~1 week",
    standaloneRoute: "/git-github",
    heroImage: "/courses/git-github.webp",
  },
];

export function getCourse(id: CourseId): CourseMeta | undefined {
  return COURSES.find((c) => c.id === id);
}
