import { useEffect, useState, useCallback } from "react";
import { getDb } from "@/lib/db";
import { askGroqChat } from "@/lib/groq";
import { searchAll, formatSourcesForPrompt, emptySources } from "@/lib/serpapi";
import { useAuthStore } from "@/store/authStore";
import type { FdeChatMessage, FdeChatRow, FdeChatSources, FdeDay } from "@/types";
import { getCapstone, getMonthMeta } from "@/lib/fde-roadmap";

function buildSystemPrompt(day: FdeDay): string {
  const month = getMonthMeta(day.month);
  const cap = day.kind === "capstone" ? getCapstone(day.month) : null;

  const lines: string[] = [
    "You are a thorough tutor for the FDE Preparation roadmap.",
    "Answer questions about the day's topic in depth — assume the user wants a complete explanation, not a one-liner.",
    "Structure your answers with Markdown: short intro, then `##` subsections (e.g., 'Concept', 'Example', 'Common pitfalls', 'Why it matters'). Use bullet lists where helpful.",
    "Wrap technical tokens like __init__, sys.getsizeof, dunder names, file paths, env vars, and shell commands in `inline code`. Use ```python\\n...\\n``` (or the right language tag) for any multi-line code, with a worked example whenever a concept is being explained.",
    "When search context is provided below, weave the most relevant findings into your answer with inline citations like [W1], [V1]. If a video is highly relevant, recommend it inline as a Markdown link, e.g. [Watch: title](url).",
    "Aim for ~25–60 lines of well-structured prose; longer when the topic warrants. Don't pad — every paragraph should add a distinct angle.",
    "If the question is unrelated to the day, briefly say so and suggest the closest on-topic question.",
    "",
    `## Day ${day.day} — Month ${day.month}, Week ${day.weekInMonth} (${day.kind})`,
  ];

  if (month) lines.push(`Month theme: ${month.title} — ${month.tagline}`);

  if (day.kind === "lesson") {
    if (day.topic) lines.push(`Topic: ${day.topic}`);
    if (day.task) lines.push(`Task: ${day.task}`);
    if (day.depth) lines.push(`Depth: ${day.depth}`);
    if (day.source) lines.push(`Source: ${day.source}`);
    if (day.whyMatters) lines.push(`\nWhy it matters: ${day.whyMatters}`);
    if (day.howToDoIt) lines.push(`\nHow to do it: ${day.howToDoIt}`);
    if (day.watchOutFor) lines.push(`\nWatch out for: ${day.watchOutFor}`);
    if (day.doneWhen) lines.push(`\nDone when: ${day.doneWhen}`);
  } else if (day.kind === "rest") {
    lines.push("Rest day. Focus on review, reading, and recovery.");
  } else if (day.kind === "capstone" && cap) {
    lines.push(`Capstone: ${cap.name} — ${cap.tagline}`);
    lines.push(`Summary: ${cap.summary}`);
    lines.push(`Stack: ${cap.stack.join(", ")}`);
    lines.push(`Outcome: ${cap.outcome}`);
  }

  if (day.dsa) {
    lines.push(`\nDSA problem (${day.dsa.tier}): ${day.dsa.title} — approach: ${day.dsa.approach}`);
  }

  return lines.join("\n");
}

export function useFdeChat(day: FdeDay | undefined) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<FdeChatMessage[]>([]);
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
      const rows = await db.select<FdeChatRow[]>(
        "SELECT * FROM fde_chat WHERE user_id = ? AND day_number = ? ORDER BY created_at ASC, id ASC",
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
      console.error("Failed to load chat", e);
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
        "INSERT INTO fde_chat (user_id, day_number, role, content, sources) VALUES (?, ?, 'user', ?, '')",
        [user.id, day.day, userContent]
      );
      const userMsg: FdeChatMessage = {
        id: Number(userInsert.lastInsertId ?? Date.now()),
        day: day.day,
        role: "user",
        content: userContent,
        sources: emptySources(),
        createdAt: new Date().toISOString(),
      };
      setMessages((m) => [...m, userMsg]);

      try {
        let sources: FdeChatSources = emptySources();
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
          "INSERT INTO fde_chat (user_id, day_number, role, content, sources) VALUES (?, ?, 'assistant', ?, ?)",
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
      "DELETE FROM fde_chat WHERE user_id = ? AND day_number = ?",
      [user.id, dayNumber]
    );
    setMessages([]);
  }, [user, dayNumber]);

  return { messages, sending, error, sendMessage, clearThread };
}

function safeParseSources(raw: string): FdeChatSources {
  try {
    const parsed = JSON.parse(raw);
    // Old shape: array of {title, link, snippet}
    if (Array.isArray(parsed)) {
      return { web: parsed, images: [], videos: [] };
    }
    // New shape
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
