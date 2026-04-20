"use client";

import { useState } from "react";
import type { Prompt } from "@/types";

interface Props {
  prompt: Prompt;
  onEdit: (p: Prompt) => void;
  onDelete: (id: number) => void;
  onCopy: (text: string) => Promise<void>;
}

const MODEL_COLORS: Record<string, { color: string; bg: string }> = {
  Gemini: { color: "#60a5fa", bg: "#1d4ed818" },
  GPT:    { color: "#4ade80", bg: "#16a34a18" },
  Claude: { color: "#f9a8d4", bg: "#db277718" },
  Any:    { color: "var(--text-muted)", bg: "var(--bg-hover)" },
};

export default function PromptCard({ prompt, onEdit, onDelete, onCopy }: Props) {
  const [copied, setCopied] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const tags = prompt.tags?.split(",").map((t) => t.trim()).filter(Boolean) ?? [];
  const model = MODEL_COLORS[prompt.model_target] ?? MODEL_COLORS.Any;

  async function handleCopy() {
    await onCopy(prompt.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{
      border: "1px solid var(--border)",
      borderRadius: 16,
      background: "var(--bg-elevated)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      transition: "border-color 0.15s, box-shadow 0.15s",
    }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      <div style={{
        padding: "16px 18px 12px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 10,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
            marginBottom: 6,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {prompt.title}
          </h3>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.04em",
              color: model.color,
              background: model.bg,
              padding: "2px 8px",
              borderRadius: 99,
            }}>
              {prompt.model_target}
            </span>
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} style={{
                fontSize: 10,
                color: "var(--text-muted)",
                background: "var(--bg-hover)",
                padding: "2px 8px",
                borderRadius: 99,
                border: "1px solid var(--border)",
              }}>
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "14px 18px", flex: 1 }}>
        <p style={{
          fontSize: 12,
          color: "var(--text-muted)",
          lineHeight: 1.7,
          display: "-webkit-box",
          WebkitLineClamp: 4,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          fontFamily: "inherit",
        }}>
          {prompt.body}
        </p>
      </div>

      <div style={{
        padding: "12px 18px",
        borderTop: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--bg-hover)",
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            onClick={() => onEdit(prompt)}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 500,
              cursor: "pointer",
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-muted)",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            }}
          >
            Edit
          </button>

          {showDelete ? (
            <button
              type="button"
              onClick={() => onDelete(prompt.id)}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 500,
                cursor: "pointer",
                border: "none",
                background: "var(--hard-bg)",
                color: "var(--hard)",
              }}
              onMouseLeave={() => setShowDelete(false)}
            >
              Confirm?
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowDelete(true)}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 500,
                cursor: "pointer",
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text-muted)",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--hard)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--hard-bg)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                setShowDelete(false);
              }}
            >
              Delete
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          style={{
            padding: "7px 18px",
            borderRadius: 9,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            border: "none",
            background: copied ? "var(--easy-bg)" : "var(--accent)",
            color: copied ? "var(--easy)" : "#fff",
            boxShadow: copied ? "none" : "0 0 12px var(--accent-glow)",
            transition: "all 0.2s ease",
            minWidth: 80,
          }}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
