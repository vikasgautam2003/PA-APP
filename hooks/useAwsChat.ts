import { useEffect, useState, useCallback } from "react";
import { getDb } from "@/lib/db";
import { askGroqChat } from "@/lib/groq";
import { searchAll, formatSourcesForPrompt, emptySources } from "@/lib/serpapi";
import { useAuthStore } from "@/store/authStore";
import type { AwsChatMessage, AwsChatRow, AwsChatSources, AwsDay } from "@/types";
import { getAwsPhaseMeta } from "@/lib/aws-roadmap";

function buildSystemPrompt(day: AwsDay): string {
  const phase = getAwsPhaseMeta(day.phase);

  const lines: string[] = [
    "You are a thorough AWS Solutions Architect tutor for the SAA-C03 90-day roadmap.",
    "Answer questions about the day's AWS topic in depth — assume the user wants a complete production-grade explanation, not a one-liner.",
    "Structure your answers with Markdown: short intro, then `##` subsections (e.g., 'Concept', 'How it works', 'CLI / config example', 'Exam trap', 'Real-world scenario'). Use bullet lists where helpful.",
    "Wrap AWS service names, ARNs, CLI commands, IAM action verbs, and config keys in `inline code` (e.g., `s3:GetObject`, `aws iam create-role`). Use ```bash, ```json, ```yaml, or ```python fenced blocks for any multi-line CLI / IaC / SDK example. Always show a real, runnable example whenever a concept is being explained.",
    "When search context is provided below, weave the most relevant findings into your answer with inline citations like [W1], [V1]. If a video or AWS docs page is highly relevant, recommend it inline as a Markdown link, e.g. [Watch: title](url).",
    "Aim for ~25–60 lines of well-structured prose; longer when the topic warrants. Don't pad — every paragraph should add a distinct angle. Always include the SAA-C03 angle: which exam domain this falls under, and the specific trap the exam loves.",
    "If the question is unrelated to the day, briefly say so and suggest the closest on-topic question.",
    "",
    `## Day ${day.day} — Phase ${day.phase}, Week ${day.weekInPhase} (${day.kind})`,
  ];

  if (phase) lines.push(`Phase theme: ${phase.title} — ${phase.tagline}`);

  if (day.kind === "lesson" || day.kind === "capstone") {
    if (day.topic) lines.push(`Topic: ${day.topic}`);
    if (day.task) lines.push(`Task: ${day.task}`);
    if (day.depth) lines.push(`Depth: ${day.depth}`);
    if (day.source) lines.push(`Source: ${day.source}`);
    if (day.examWeight) lines.push(`SAA-C03 weight: ${day.examWeight}`);
    if (day.whyMatters) lines.push(`\nWhy it matters: ${day.whyMatters}`);
    if (day.howToDoIt) lines.push(`\nHow to do it: ${day.howToDoIt}`);
    if (day.watchOutFor) lines.push(`\nWatch out for: ${day.watchOutFor}`);
    if (day.doneWhen) lines.push(`\nDone when: ${day.doneWhen}`);
    if (day.examTrap) lines.push(`\nExam trap: ${day.examTrap}`);
    if (day.realWorld) lines.push(`\nReal-world: ${day.realWorld}`);
  } else if (day.kind === "review") {
    lines.push("Review day. Consolidate the week's services, test yourself with practice questions, redo any failed labs.");
  }

  if (day.sections && day.sections.length > 0) {
    lines.push(`\nSections in this day:`);
    for (const s of day.sections) {
      lines.push(`- [${s.tone}] ${s.label}`);
    }
  }

  return lines.join("\n");
}

export function useAwsChat(day: AwsDay | undefined) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<AwsChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dayNumber = day?.day;

  useEffect(() => {
    if (!user || !dayNumber) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const db = await getDb();
      const rows = await db.select<AwsChatRow[]>(
        "SELECT * FROM aws_chat WHERE user_id = ? AND day_number = ? ORDER BY created_at ASC, id ASC",
        [user.id, dayNumber]
      );
      if (cancelled) return;
      setMessages(
        rows.map((r) => ({
          id: r.id,
          day: r.day_number,
          role: r.role === "assistant" ? "assistant" : "user",
          content: r.content,
          sources: r.sources ? safeParseSources(r.sources) : emptySources(),
          createdAt: r.created_at,
        }))
      );
    })().catch((e) => {
      console.error("Failed to load AWS chat", e);
    });
    return () => { cancelled = true; };
  }, [user, dayNumber]);

  const sendMessage = useCallback(
    async (text: string, useWebSearch: boolean) => {
      if (!user || !day || !text.trim() || sending) return;
      setSending(true);
      setError(null);

      const db = await getDb();
      const userContent = text.trim();

      const userInsert = await db.execute(
        "INSERT INTO aws_chat (user_id, day_number, role, content, sources) VALUES (?, ?, 'user', ?, '')",
        [user.id, day.day, userContent]
      );
      const userMsg: AwsChatMessage = {
        id: Number(userInsert.lastInsertId ?? Date.now()),
        day: day.day,
        role: "user",
        content: userContent,
        sources: emptySources(),
        createdAt: new Date().toISOString(),
      };
      setMessages((m) => [...m, userMsg]);

      try {
        let sources: AwsChatSources = emptySources();
        let augmentedSystem = buildSystemPrompt(day);

        if (useWebSearch) {
          try {
            sources = await searchAll(userContent);
            const block = formatSourcesForPrompt(sources);
            if (block) augmentedSystem += `\n\n${block}`;
          } catch (e) {
            console.warn("SerpAPI failed, continuing without search", e);
          }
        }

        const history = [...messages, userMsg].slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const reply = await askGroqChat(history, augmentedSystem);

        const sourcesJson = JSON.stringify(sources);
        const asstInsert = await db.execute(
          "INSERT INTO aws_chat (user_id, day_number, role, content, sources) VALUES (?, ?, 'assistant', ?, ?)",
          [user.id, day.day, reply, sourcesJson]
        );

        setMessages((m) => [
          ...m,
          {
            id: Number(asstInsert.lastInsertId ?? Date.now() + 1),
            day: day.day,
            role: "assistant",
            content: reply,
            sources,
            createdAt: new Date().toISOString(),
          },
        ]);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to get a response.";
        setError(msg);
      } finally {
        setSending(false);
      }
    },
    [user, day, sending, messages]
  );

  const clearThread = useCallback(async () => {
    if (!user || !dayNumber) return;
    const db = await getDb();
    await db.execute(
      "DELETE FROM aws_chat WHERE user_id = ? AND day_number = ?",
      [user.id, dayNumber]
    );
    setMessages([]);
  }, [user, dayNumber]);

  return { messages, sending, error, sendMessage, clearThread };
}

function safeParseSources(raw: string): AwsChatSources {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return { web: parsed, images: [], videos: [] };
    }
    if (parsed && typeof parsed === "object") {
      return {
        web: Array.isArray(parsed.web) ? parsed.web : [],
        images: Array.isArray(parsed.images) ? parsed.images : [],
        videos: Array.isArray(parsed.videos) ? parsed.videos : [],
        answerBox: parsed.answerBox,
      };
    }
    return emptySources();
  } catch {
    return emptySources();
  }
}
