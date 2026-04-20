"use client";

import { useState } from "react";
import type { Prompt, PromptFormData, ModelTarget } from "@/types";

const MODELS: ModelTarget[] = ["Any", "Gemini", "GPT", "Claude"];

interface Props {
  initial?: Prompt;
  onSubmit: (data: PromptFormData) => Promise<void>;
  onCancel: () => void;
}

export default function PromptForm({ initial, onSubmit, onCancel }: Props) {
  const [title, setTitle]       = useState(initial?.title ?? "");
  const [body, setBody]         = useState(initial?.body ?? "");
  const [tags, setTags]         = useState(initial?.tags ?? "");
  const [model, setModel]       = useState<ModelTarget>(initial?.model_target ?? "Any");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit() {
    if (!title.trim() || !body.trim()) {
      setError("Title and body are required");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ title: title.trim(), body: body.trim(), tags: tags.trim(), model_target: model });
    } catch {
      setError("Failed to save prompt");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "11px 16px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    fontSize: 13,
    color: "var(--text-primary)",
    background: "var(--bg-elevated)",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  } as React.CSSProperties;

  const labelStyle = {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--text-muted)",
    marginBottom: 6,
    display: "block",
  } as React.CSSProperties;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 50,
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 560,
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
      }}>
        <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{
            fontSize: 18,
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}>
            {initial ? "Edit Prompt" : "New Prompt"}
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
            {initial ? "Update your saved prompt" : "Add a new prompt to your vault"}
          </p>
        </div>

        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={labelStyle}>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Debug this code"
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--accent)";
                e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div>
            <label style={labelStyle}>Prompt Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your prompt here..."
              rows={6}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6, fontFamily: "inherit" }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--accent)";
                e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>
                Tags <span style={{ color: "var(--text-faint)" }}>(comma separated)</span>
              </label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="coding, debug, explain"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--accent)";
                  e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            <div>
              <label style={labelStyle}>Target Model</label>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {MODELS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setModel(m)}
                    type="button"
                    style={{
                      padding: "8px 14px",
                      borderRadius: 9,
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      border: "1px solid var(--border)",
                      background: model === m ? "var(--accent)" : "var(--bg-elevated)",
                      color: model === m ? "#fff" : "var(--text-muted)",
                      boxShadow: model === m ? "0 0 12px var(--accent-glow)" : "none",
                      transition: "all 0.15s",
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div style={{
              padding: "10px 14px",
              borderRadius: 10,
              fontSize: 12,
              color: "var(--hard)",
              background: "var(--hard-bg)",
              border: "1px solid var(--hard-bg)",
            }}>
              {error}
            </div>
          )}
        </div>

        <div style={{
          padding: "16px 28px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          background: "var(--bg-hover)",
        }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "9px 22px",
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-muted)",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: "9px 22px",
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              border: "none",
              background: "var(--accent)",
              color: "#fff",
              opacity: loading ? 0.7 : 1,
              boxShadow: "0 0 16px var(--accent-glow)",
            }}
          >
            {loading ? "Saving…" : initial ? "Update Prompt" : "Save Prompt"}
          </button>
        </div>
      </div>
    </div>
  );
}
