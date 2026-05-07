"use client";

import { useState, useEffect, useRef } from "react";
import { getDb } from "@/lib/db";
import { useAuthStore } from "@/store/authStore";

interface Props {
  open: boolean;
  onClose: () => void;
}

type CaptureType = "note" | "task";

export default function QuickCapture({ open, onClose }: Props) {
  const { user } = useAuthStore();
  const [text, setText]       = useState("");
  const [type, setType]       = useState<CaptureType>("task");
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setText("");
      setSaved(false);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleSave() {
    if (!text.trim() || !user || saving) return;
    setSaving(true);
    try {
      const db = await getDb();
      if (type === "note") {
        const now = new Date().toISOString();
        await db.execute(
          "INSERT INTO notes (user_id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
          [user.id, text.trim().slice(0, 60), text.trim(), now, now]
        );
      } else {
        // Add to planner subtopics as a quick task (no topic — general queue)
        const maxOrder = await db.select<{ n: number }[]>(
          "SELECT COUNT(*) as n FROM planner_subtopics WHERE user_id = ?",
          [user.id]
        );
        await db.execute(
          "INSERT INTO planner_subtopics (topic_id, user_id, label, timestamp_raw, order_index) VALUES (?, ?, ?, ?, ?)",
          [null, user.id, text.trim(), "", maxOrder[0]?.n ?? 0]
        );
      }
      setSaved(true);
      setTimeout(() => { onClose(); }, 700);
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 480, background: "var(--bg-elevated)",
          border: "1px solid var(--border)", borderRadius: 18,
          padding: "20px 22px", boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
          display: "flex", flexDirection: "column", gap: 14,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            Quick Capture
          </span>
          <div style={{ display: "flex", gap: 1, background: "var(--bg-base)", border: "1px solid var(--border)", borderRadius: 8, padding: 2 }}>
            {(["task", "note"] as CaptureType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                style={{
                  padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                  border: "none", cursor: "pointer",
                  background: type === t ? "var(--bg-surface)" : "transparent",
                  color: type === t ? "var(--accent-text)" : "var(--text-muted)",
                  boxShadow: type === t ? "var(--shadow-card)" : "none",
                  transition: "all 0.1s",
                }}
              >
                {t === "task" ? "Task" : "Note"}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder={type === "task" ? "Add to planner queue…" : "Capture a thought…"}
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 10,
            border: "1px solid var(--border)", fontSize: 14,
            color: "var(--text-primary)", background: "var(--bg-surface)",
            outline: "none", transition: "border-color 0.15s",
            boxSizing: "border-box",
          }}
          onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
          onBlur={(e)  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
        />

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "var(--text-faint)" }}>
            {type === "task" ? "Saves to planner queue" : "Saves to notes"}
            {" · "}Enter to save · Esc to dismiss
          </span>
          <button
            onClick={handleSave}
            disabled={!text.trim() || saving}
            style={{
              padding: "8px 18px", borderRadius: 9, border: "none",
              fontSize: 12, fontWeight: 700, cursor: !text.trim() ? "not-allowed" : "pointer",
              background: saved ? "var(--easy)" : !text.trim() ? "var(--border)" : "var(--accent)",
              color: !text.trim() ? "var(--text-muted)" : "#fff",
              boxShadow: !text.trim() ? "none" : saved ? "0 0 12px var(--easy)" : "0 0 12px var(--accent-glow)",
              transition: "all 0.2s",
            }}
          >
            {saved ? "Saved ✓" : saving ? "…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
