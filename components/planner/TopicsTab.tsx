"use client";

import { useState } from "react";
import type { PlannerTopicWithSubtopics } from "@/types";

interface Props {
  topics: PlannerTopicWithSubtopics[];
  onAdd: (title: string, subtopics: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function TopicsTab({ topics, onAdd, onDelete }: Props) {
  const [title, setTitle]         = useState("");
  const [subtopics, setSubtopics] = useState("");
  const [saving, setSaving]       = useState(false);
  const [expanded, setExpanded]   = useState<number | null>(null);
  const [deleteId, setDeleteId]   = useState<number | null>(null);

  async function handleAdd() {
    if (!title.trim() || !subtopics.trim()) return;
    setSaving(true);
    await onAdd(title, subtopics);
    setTitle(""); setSubtopics("");
    setSaving(false);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: "1px solid var(--border)", fontSize: 13,
    color: "var(--text-primary)", background: "var(--bg-elevated)", outline: "none",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 20, alignItems: "start" }}>

      {/* Add form */}
      <div style={{ border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", background: "var(--bg-elevated)" }}>
        <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Add Topic</h3>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
            Paste subtopics with timestamps (HH:MM:SS Label) or just labels
          </p>
        </div>

        <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
              Main Topic Name
            </label>
            <input
              value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AWS, System Design, React..."
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
              Subtopics <span style={{ color: "var(--text-faint)" }}>(one per line)</span>
            </label>
            <textarea
              value={subtopics} onChange={(e) => setSubtopics(e.target.value)}
              placeholder={`02:00:12 AWS EBS Service\n02:39:56 AWS AMI\n02:56:44 AWS ELB & ASG\n\nOr just:\nEBS Service\nAMI\nELB & ASG`}
              rows={10}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7, fontFamily: "monospace", fontSize: 12 }}
              onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
            />
          </div>
        </div>

        <div style={{ padding: "14px 22px", borderTop: "1px solid var(--border)", background: "var(--bg-hover)" }}>
          <button onClick={handleAdd} disabled={saving || !title.trim() || !subtopics.trim()} style={{
            width: "100%", padding: 11, borderRadius: 10, border: "none",
            fontSize: 13, fontWeight: 600,
            cursor: saving || !title || !subtopics ? "not-allowed" : "pointer",
            background: saving || !title || !subtopics ? "var(--border)" : "var(--accent)",
            color: saving || !title || !subtopics ? "var(--text-muted)" : "#fff",
            boxShadow: saving || !title || !subtopics ? "none" : "0 0 14px var(--accent-glow)",
          }}>
            {saving ? "Adding…" : "Add to Queue"}
          </button>
        </div>
      </div>

      {/* Topic queue */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Topic Queue — {topics.length} topics
          </h3>
          <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Planner assigns in this order</p>
        </div>

        {topics.length === 0 ? (
          <div style={{
            border: "1px solid var(--border)", borderRadius: 14,
            padding: "48px 24px", background: "var(--bg-elevated)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 32 }}>▦</span>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>No topics yet</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Add your first topic to start planning</p>
          </div>
        ) : (
          topics.map((topic, idx) => {
            const doneSubs  = topic.subtopics.filter((s) => s.is_done).length;
            const totalSubs = topic.subtopics.length;
            const pct       = totalSubs > 0 ? Math.round((doneSubs / totalSubs) * 100) : 0;
            const isExpanded = expanded === topic.id;

            return (
              <div key={topic.id} style={{
                border: "1px solid var(--border)", borderRadius: 14,
                background: "var(--bg-elevated)", overflow: "hidden",
                transition: "border-color 0.15s",
              }}>
                <div
                  style={{
                    padding: "14px 18px", display: "flex", alignItems: "center",
                    gap: 12, cursor: "pointer",
                  }}
                  onClick={() => setExpanded(isExpanded ? null : topic.id)}
                >
                  {/* Order badge */}
                  <div style={{
                    width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                    background: "var(--accent-glow)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 800, color: "var(--accent-text)",
                  }}>{idx + 1}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                        {topic.title}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {doneSubs}/{totalSubs} done
                      </span>
                    </div>
                    <div style={{ height: 3, background: "var(--border)", borderRadius: 99 }}>
                      <div style={{
                        height: "100%", width: `${pct}%`,
                        background: pct === 100 ? "var(--easy)" : "var(--accent)",
                        borderRadius: 99, transition: "width 0.4s ease",
                      }} />
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>▼</span>
                    {deleteId === topic.id ? (
                      <button onClick={(e) => { e.stopPropagation(); onDelete(topic.id); setDeleteId(null); }} style={{
                        padding: "4px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600,
                        cursor: "pointer", border: "none",
                        background: "var(--hard-bg)", color: "var(--hard)",
                      }} onMouseLeave={() => setDeleteId(null)}>Sure?</button>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); setDeleteId(topic.id); }} style={{
                        padding: "4px 10px", borderRadius: 7, fontSize: 11,
                        cursor: "pointer", border: "1px solid var(--border)",
                        background: "transparent", color: "var(--text-muted)",
                      }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--hard)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; setDeleteId(null); }}
                      >✕</button>
                    )}
                  </div>
                </div>

                {/* Subtopics */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid var(--border)", padding: "10px 18px 14px" }}>
                    {topic.subtopics.map((sub, i) => (
                      <div key={sub.id} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "7px 0",
                        borderBottom: i < topic.subtopics.length - 1 ? "1px solid var(--border)" : "none",
                        opacity: sub.is_done ? 0.5 : 1,
                      }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                          border: `1.5px solid ${sub.is_done ? "var(--easy)" : "var(--border-subtle)"}`,
                          background: sub.is_done ? "var(--easy)" : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {sub.is_done && (
                            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                              <path d="M1 3.5L4 7.5L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        {sub.timestamp_raw && (
                          <span style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "monospace", flexShrink: 0 }}>
                            {sub.timestamp_raw}
                          </span>
                        )}
                        <span style={{
                          fontSize: 12, color: sub.is_done ? "var(--text-muted)" : "var(--text-secondary)",
                          textDecoration: sub.is_done ? "line-through" : "none",
                          flex: 1,
                        }}>
                          {sub.label}
                        </span>
                        <span style={{ fontSize: 10, color: "var(--text-faint)" }}>#{i + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
