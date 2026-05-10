import type { AwsDay, AwsSection } from "@/types";

export function s(
  id: string,
  label: string,
  tone: AwsSection["tone"],
  body: string,
  extra?: Partial<AwsSection>
): AwsSection {
  return { id, label, tone, body, ...extra };
}

export function lesson(
  d: Partial<AwsDay> & {
    day: number;
    phase: AwsDay["phase"];
    weekInPhase: number;
    phaseProgress: number;
  }
): AwsDay {
  return { kind: "lesson", ...d };
}

export function review(
  day: number,
  phase: AwsDay["phase"],
  weekInPhase: number,
  phaseProgress: number,
  topic: string,
  task: string
): AwsDay {
  return { day, phase, weekInPhase, kind: "review", phaseProgress, topic, task };
}

export function capstone(
  day: number,
  phase: AwsDay["phase"],
  weekInPhase: number,
  phaseProgress: number,
  topic: string,
  task: string
): AwsDay {
  return { day, phase, weekInPhase, kind: "capstone", phaseProgress, topic, task };
}
