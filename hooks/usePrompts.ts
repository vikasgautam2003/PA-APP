import { useEffect, useMemo } from "react";
import { usePromptStore } from "@/store/promptStore";
import { useAuthStore } from "@/store/authStore";
import { getDb } from "@/lib/db";
import type { Prompt, PromptFormData } from "@/types";

export function usePrompts() {
  const { user } = useAuthStore();
  const store = usePromptStore();

  useEffect(() => {
    if (user) load();
  }, [user]);

  async function load() {
    store.setLoading(true);
    try {
      const db = await getDb();
      const rows = await db.select<Prompt[]>(
        "SELECT * FROM prompts WHERE user_id = ? ORDER BY updated_at DESC",
        [user!.id]
      );
      store.setPrompts(rows);
    } finally {
      store.setLoading(false);
    }
  }

  async function create(data: PromptFormData): Promise<void> {
    const db = await getDb();
    await db.execute(
      `INSERT INTO prompts (user_id, title, body, tags, model_target)
       VALUES (?, ?, ?, ?, ?)`,
      [user!.id, data.title, data.body, data.tags, data.model_target]
    );
    await load();
  }

  async function update(id: number, data: PromptFormData): Promise<void> {
    const db = await getDb();
    await db.execute(
      `UPDATE prompts SET title=?, body=?, tags=?, model_target=?, updated_at=CURRENT_TIMESTAMP
       WHERE id=? AND user_id=?`,
      [data.title, data.body, data.tags, data.model_target, id, user!.id]
    );
    await load();
  }

  async function remove(id: number): Promise<void> {
    const db = await getDb();
    await db.execute("DELETE FROM prompts WHERE id=? AND user_id=?", [id, user!.id]);
    store.deletePrompt(id);
  }

  async function copyToClipboard(text: string): Promise<void> {
    await navigator.clipboard.writeText(text);
  }

  async function exportJSON(): Promise<void> {
    const blob = new Blob([JSON.stringify(store.prompts, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "devkit-prompts.json"; a.click();
    URL.revokeObjectURL(url);
  }

  async function importJSON(file: File): Promise<void> {
    const text = await file.text();
    const items = JSON.parse(text) as PromptFormData[];
    for (const item of items) {
      await create(item);
    }
  }

  const allTags = useMemo(() => {
    const tags = new Set<string>(["All"]);
    store.prompts.forEach((p) => {
      p.tags?.split(",").forEach((t) => {
        const clean = t.trim();
        if (clean) tags.add(clean);
      });
    });
    return Array.from(tags);
  }, [store.prompts]);

  const filtered = useMemo(() => {
    return store.prompts.filter((p) => {
      if (store.searchQuery && !p.title.toLowerCase().includes(store.searchQuery.toLowerCase()) &&
          !p.body.toLowerCase().includes(store.searchQuery.toLowerCase())) return false;
      if (store.selectedTag !== "All" && !p.tags?.includes(store.selectedTag)) return false;
      if (store.selectedModel !== "All" && p.model_target !== store.selectedModel) return false;
      return true;
    });
  }, [store.prompts, store.searchQuery, store.selectedTag, store.selectedModel]);

  return { ...store, filtered, allTags, create, update, remove, copyToClipboard, exportJSON, importJSON, reload: load };
}
