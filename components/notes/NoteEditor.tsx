"use client";

import { useState, useEffect, useRef } from "react";
import type { Note, NoteColor, NoteFormData } from "@/types/notes";

const COLORS: { id: NoteColor; label: string; dot: string }[] = [
  { id: "default", label: "Default", dot: "var(--border)" },
  { id: "blue",    label: "Blue",    dot: "#3b82f6" },
  { id: "green",   label: "Green",   dot: "var(--easy)" },
  { id: "amber",   label: "Amber",   dot: "var(--medium)" },
  { id: "red",     label: "Red",     dot: "var(--hard)" },
  { id: "purple",  label: "Purple",  dot: "#8b5cf6" },
  { id: "pink",    label: "Pink",    dot: "#ec4899" },
];

interface Props {
  note?: Note | null;
  allTopics: string[];
  onSave: (data: NoteFormData) => Promise<void>;
  onClose: () => void;
}

export default function NoteEditor({ note, allTopics, onSave, onClose }: Props) {
  const [title, setTitle]     = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [topic, setTopic]     = useState(note?.topic ?? "");
  const [color, setColor]     = useState<NoteColor>(note?.color ?? "default");
  const [pinned, setPinned]   = useState(note?.pinned === 1);
  const [saving, setSaving]   = useState(false);
  const [preview, setPreview] = useState(false);
  const [topicSuggestions, setTopicSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions]   = useState(false);

  const titleRef   = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (topic.trim()) {
      const q = topic.toLowerCase();
      setTopicSuggestions(allTopics.filter((t) => t.toLowerCase().includes(q) && t !== topic));
    } else {
      setTopicSuggestions(allTopics);
    }
  }, [topic, allTopics]);

  function wordCount() {
    return content.trim() === "" ? 0 : content.trim().split(/\s+/).length;
  }

  function charCount() {
    return content.length;
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      void handleSave();
    }
    if (e.key === "Escape") onClose();
  }

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave({ title, content, topic, color, pinned });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  // Handle tab key to insert spaces in textarea
  function handleTextareaKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newValue = content.slice(0, start) + "  " + content.slice(end);
      setContent(newValue);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 2;
      });
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void handleSave();
    if (e.key === "Escape") onClose();
  }

  const selectedColor = COLORS.find((c) => c.id === color)!;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
        zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        style={{
          background: "var(--bg-elevated)",
          border: `1px solid ${selectedColor.dot === "var(--border)" ? "var(--border)" : selectedColor.dot}`,
          borderRadius: 18, width: "100%", maxWidth: 680,
          maxHeight: "90vh", display: "flex", flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "18px 22px 14px",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: 12,
          background: "var(--bg-hover)", flexShrink: 0,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg, var(--accent), #7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, color: "#fff", flexShrink: 0,
          }}>✎</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", flex: 1 }}>
            {note ? "Edit Note" : "New Note"}
          </span>

          {/* Preview toggle */}
          <button
            onClick={() => setPreview(!preview)}
            style={{
              padding: "5px 12px", borderRadius: 8,
              border: `1px solid ${preview ? "var(--accent)" : "var(--border)"}`,
              background: preview ? "var(--accent-glow)" : "var(--bg-surface)",
              color: preview ? "var(--accent-text)" : "var(--text-muted)",
              fontSize: 11, fontWeight: 600, cursor: "pointer",
              transition: "all 0.12s",
            }}
          >
            {preview ? "Edit" : "Preview"}
          </button>

          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 8, background: "none",
              border: "1px solid var(--border)", cursor: "pointer",
              color: "var(--text-muted)", fontSize: 14,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.12s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--hard)"; (e.currentTarget as HTMLElement).style.color = "var(--hard)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Title */}
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title…"
            style={{
              fontSize: 20, fontWeight: 700,
              color: "var(--text-primary)", letterSpacing: "-0.02em",
              background: "transparent", border: "none", outline: "none",
              width: "100%", padding: "0",
              fontFamily: "inherit",
            }}
          />

          {/* Metadata row: topic + color + pin */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* Topic input with suggestions */}
            <div style={{ position: "relative", flex: "1 1 180px" }}>
              <input
                value={topic}
                onChange={(e) => { setTopic(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Topic (e.g. React, Interview…)"
                style={{
                  fontSize: 12, padding: "7px 12px",
                  borderRadius: 9, border: "1px solid var(--border)",
                  background: "var(--bg-surface)", color: "var(--text-primary)",
                  outline: "none", width: "100%", fontFamily: "inherit",
                  transition: "border-color 0.12s",
                }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.borderColor = "var(--accent)")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.borderColor = "var(--border)")}
              />
              {showSuggestions && topicSuggestions.length > 0 && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10,
                  background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  borderRadius: 9, boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                  marginTop: 4, overflow: "hidden",
                }}>
                  {topicSuggestions.slice(0, 6).map((t) => (
                    <div
                      key={t}
                      onMouseDown={() => { setTopic(t); setShowSuggestions(false); }}
                      style={{
                        padding: "8px 12px", fontSize: 12,
                        color: "var(--text-secondary)", cursor: "pointer",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg-hover)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                    >
                      {t}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Color picker */}
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  title={c.label}
                  onClick={() => setColor(c.id)}
                  style={{
                    width: 18, height: 18, borderRadius: "50%",
                    background: c.dot,
                    border: color === c.id ? "2px solid var(--text-primary)" : "2px solid transparent",
                    cursor: "pointer", flexShrink: 0,
                    boxShadow: color === c.id ? `0 0 0 2px ${c.dot}40` : "none",
                    transition: "all 0.12s",
                  }}
                />
              ))}
            </div>

            {/* Pin toggle */}
            <button
              onClick={() => setPinned(!pinned)}
              style={{
                padding: "6px 12px", borderRadius: 9,
                border: `1px solid ${pinned ? "var(--accent)" : "var(--border)"}`,
                background: pinned ? "var(--accent-glow)" : "var(--bg-surface)",
                color: pinned ? "var(--accent-text)" : "var(--text-muted)",
                fontSize: 11, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5,
                transition: "all 0.12s",
              }}
            >
              📌 {pinned ? "Pinned" : "Pin"}
            </button>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--border)" }} />

          {/* Content area */}
          {preview ? (
            <div style={{
              fontSize: 13, lineHeight: 1.8, color: "var(--text-secondary)",
              minHeight: 200, whiteSpace: "pre-wrap", wordBreak: "break-word",
            }}>
              {content || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Nothing to preview yet…</span>}
            </div>
          ) : (
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder="Write your note here… supports plain text.&#10;&#10;Tip: ⌘+Enter to save, Esc to close, Tab for indent."
              style={{
                fontSize: 13, lineHeight: 1.8,
                color: "var(--text-primary)",
                background: "transparent", border: "none", outline: "none",
                width: "100%", resize: "none", minHeight: 240,
                fontFamily: "inherit",
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 22px",
          borderTop: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "var(--bg-hover)", flexShrink: 0,
        }}>
          <div style={{ display: "flex", gap: 14 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {wordCount()} word{wordCount() !== 1 ? "s" : ""}
            </span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {charCount()} chars
            </span>
            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>⌘+Enter to save</span>
          </div>

          {!preview && (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={onClose}
                style={{
                  padding: "8px 18px", borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "var(--bg-surface)",
                  color: "var(--text-muted)",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.12s",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => void handleSave()}
                disabled={!title.trim() || saving}
                style={{
                  padding: "8px 22px", borderRadius: 10,
                  border: "none",
                  background: !title.trim() || saving ? "var(--border)" : "var(--accent)",
                  color: !title.trim() || saving ? "var(--text-muted)" : "#fff",
                  fontSize: 13, fontWeight: 700, cursor: !title.trim() || saving ? "not-allowed" : "pointer",
                  transition: "all 0.12s",
                  boxShadow: !title.trim() || saving ? "none" : "0 0 12px var(--accent-glow)",
                }}
              >
                {saving ? "Saving…" : note ? "Save Changes" : "Create Note"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
