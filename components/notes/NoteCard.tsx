"use client";

import type { Note } from "@/types/notes";

const COLOR_MAP: Record<string, { border: string; bg: string; dot: string }> = {
  default: { border: "var(--border)",    bg: "var(--bg-elevated)", dot: "var(--text-muted)" },
  blue:    { border: "#3b82f6",          bg: "rgba(59,130,246,0.08)", dot: "#3b82f6" },
  green:   { border: "var(--easy)",      bg: "var(--easy-bg)",     dot: "var(--easy)" },
  amber:   { border: "var(--medium)",    bg: "var(--medium-bg)",   dot: "var(--medium)" },
  red:     { border: "var(--hard)",      bg: "var(--hard-bg)",     dot: "var(--hard)" },
  purple:  { border: "#8b5cf6",          bg: "rgba(139,92,246,0.08)", dot: "#8b5cf6" },
  pink:    { border: "#ec4899",          bg: "rgba(236,72,153,0.08)", dot: "#ec4899" },
};

function wordCount(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

interface Props {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: number) => void;
  onTogglePin: (note: Note) => void;
}

export default function NoteCard({ note, onEdit, onDelete, onTogglePin }: Props) {
  const colors = COLOR_MAP[note.color] ?? COLOR_MAP.default;
  const words = wordCount(note.content);
  const preview = note.content.replace(/#+\s/g, "").replace(/\*\*/g, "").replace(/\*/g, "").trim();

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    await navigator.clipboard.writeText(note.content);
  }

  return (
    <div
      onClick={() => onEdit(note)}
      style={{
        border: `1px solid ${colors.border}`,
        borderRadius: 14,
        background: colors.bg,
        boxShadow: "var(--shadow-card)",
        padding: "16px 18px",
        cursor: "pointer",
        transition: "transform 0.12s ease, box-shadow 0.12s ease",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px rgba(0,0,0,0.15), 0 0 0 1px ${colors.border}`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card)";
      }}
    >
      {/* Color accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: 3, background: colors.dot, borderRadius: "14px 14px 0 0",
        opacity: note.color === "default" ? 0 : 1,
      }} />

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: note.color !== "default" ? 4 : 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 14, fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            lineHeight: 1.3, marginBottom: 2,
          }}>
            {note.pinned === 1 && (
              <span style={{ fontSize: 10, marginRight: 5, opacity: 0.7 }}>📌</span>
            )}
            {note.title}
          </p>
          {note.topic && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: colors.dot,
              background: `${colors.dot}18`,
              padding: "2px 8px", borderRadius: 99,
              border: `1px solid ${colors.dot}30`,
            }}>
              {note.topic}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ display: "flex", gap: 4, flexShrink: 0 }}
        >
          <button
            title={note.pinned === 1 ? "Unpin" : "Pin"}
            onClick={(e) => { e.stopPropagation(); onTogglePin(note); }}
            style={{
              width: 26, height: 26, borderRadius: 7,
              background: note.pinned === 1 ? "var(--accent-glow)" : "none",
              border: `1px solid ${note.pinned === 1 ? "var(--accent)" : "var(--border)"}`,
              cursor: "pointer", color: note.pinned === 1 ? "var(--accent-text)" : "var(--text-muted)",
              fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.12s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = note.pinned === 1 ? "var(--accent)" : "var(--border)"; }}
          >
            📌
          </button>
          <button
            title="Copy content"
            onClick={handleCopy}
            style={{
              width: 26, height: 26, borderRadius: 7,
              background: "none", border: "1px solid var(--border)",
              cursor: "pointer", color: "var(--text-muted)",
              fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.12s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent-text)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
          >
            ⎘
          </button>
          <button
            title="Delete note"
            onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
            style={{
              width: 26, height: 26, borderRadius: 7,
              background: "none", border: "1px solid var(--border)",
              cursor: "pointer", color: "var(--text-muted)",
              fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.12s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--hard)"; (e.currentTarget as HTMLElement).style.color = "var(--hard)"; (e.currentTarget as HTMLElement).style.background = "var(--hard-bg)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; (e.currentTarget as HTMLElement).style.background = "none"; }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content preview */}
      {preview && (
        <p style={{
          fontSize: 12, color: "var(--text-muted)",
          lineHeight: 1.6, display: "-webkit-box",
          WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {preview}
        </p>
      )}

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
          {timeAgo(note.created_at)}
        </span>
        {words > 0 && (
          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
            {words} word{words !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
