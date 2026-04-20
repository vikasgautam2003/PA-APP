"use client";

import { useState, useRef } from "react";
import { usePrompts } from "@/hooks/usePrompts";
import PageWrapper from "@/components/layout/PageWrapper";
import PromptCard from "@/components/prompts/PromptCard";
import PromptForm from "@/components/prompts/PromptForm";
import type { Prompt } from "@/types";

const MODELS = ["All", "Any", "Gemini", "GPT", "Claude"];

export default function PromptsPage() {
  const {
    filtered, allTags, isLoading,
    searchQuery, selectedTag, selectedModel,
    setSearchQuery, setSelectedTag, setSelectedModel,
    create, update, remove, copyToClipboard, exportJSON, importJSON,
  } = usePrompts();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Prompt | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(p: Prompt) {
    setEditing(p);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  async function handleSubmit(data: Parameters<typeof create>[0]) {
    if (editing) await update(editing.id, data);
    else await create(data);
    closeForm();
  }

  return (
    <>
      <PageWrapper
        title="Prompt Vault"
        subtitle={`${filtered.length} prompts`}
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => importRef.current?.click()}
              style={{
                padding: "9px 18px",
                borderRadius: 9,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text-muted)",
              }}
            >
              Import
            </button>
            <button
              type="button"
              onClick={exportJSON}
              style={{
                padding: "9px 18px",
                borderRadius: 9,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text-muted)",
              }}
            >
              Export
            </button>
            <button
              type="button"
              onClick={openCreate}
              style={{
                padding: "9px 22px",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                boxShadow: "0 0 16px var(--accent-glow)",
              }}
            >
              + New Prompt
            </button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts by title or content..."
            style={{
              width: "100%",
              padding: "12px 18px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              fontSize: 14,
              color: "var(--text-primary)",
              background: "var(--bg-elevated)",
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--accent)";
              e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border)";
              e.target.style.boxShadow = "none";
            }}
          />

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {allTags.slice(0, 10).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 99,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    border: "1px solid var(--border)",
                    background: selectedTag === tag ? "var(--accent)" : "var(--bg-elevated)",
                    color: selectedTag === tag ? "#fff" : "var(--text-muted)",
                    boxShadow: selectedTag === tag ? "0 0 10px var(--accent-glow)" : "none",
                    transition: "all 0.15s",
                  }}
                >
                  {tag === "All" ? "All Tags" : `#${tag}`}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 4, background: "var(--bg-elevated)", padding: 4, borderRadius: 12, border: "1px solid var(--border)", marginLeft: "auto" }}>
              {MODELS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedModel(m)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 9,
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: "pointer",
                    border: "none",
                    background: selectedModel === m ? "var(--accent)" : "transparent",
                    color: selectedModel === m ? "#fff" : "var(--text-muted)",
                    transition: "all 0.15s",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "var(--text-muted)", fontSize: 13 }}>
            Loading prompts…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 260, gap: 16 }}>
            <div style={{ fontSize: 40 }}>◎</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>No prompts yet</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Save your first AI prompt to get started</p>
            <button
              type="button"
              onClick={openCreate}
              style={{
                marginTop: 4,
                padding: "10px 24px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                boxShadow: "0 0 16px var(--accent-glow)",
              }}
            >
              + New Prompt
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {filtered.map((p) => (
              <PromptCard
                key={p.id}
                prompt={p}
                onEdit={openEdit}
                onDelete={remove}
                onCopy={copyToClipboard}
              />
            ))}
          </div>
        )}
      </PageWrapper>

      <input
        ref={importRef}
        type="file"
        accept=".json"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) importJSON(file);
          e.target.value = "";
        }}
      />

      {showForm && (
        <PromptForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      )}
    </>
  );
}
