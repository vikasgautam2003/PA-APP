"use client";

import { useState, useEffect, useRef } from "react";
import type { ChatMessage } from "@/types";

const QUICK_PROMPTS = [
  "How am I doing this month?",
  "Where am I overspending?",
  "Can I afford a ₹5000 splurge?",
  "How to reach my goal faster?",
  "Give me a spending challenge",
  "Am I on track?",
];

interface Props {
  messages: ChatMessage[];
  isChatLoading: boolean;
  onSend: (text: string) => Promise<void>;
  onClear: () => void;
}

export default function GuruChat({ messages, isChatLoading, onSend, onClear }: Props) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatLoading]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isChatLoading) return;
    setInput("");
    await onSend(text);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── IDENTITY HERO ── */}
      <div style={{
        borderRadius: 20, padding: "24px 28px",
        background: "var(--bg-elevated)", border: "1px solid rgba(255,255,255,0.07)",
        position: "relative", overflow: "hidden",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 50% 80% at 90% 50%, rgba(94,92,230,0.12) 0%, transparent 70%)",
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "linear-gradient(135deg, #5e5ce6, #0a84ff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, flexShrink: 0,
            boxShadow: "0 4px 20px rgba(94,92,230,0.5)",
          }}>🧘</div>
          <div>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Guru</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
              Knows your numbers. Speaks plainly.
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={onClear} style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, color: "rgba(255,255,255,0.4)", cursor: "pointer",
            padding: "6px 14px", fontSize: 12, position: "relative",
          }}>Clear</button>
        )}
      </div>

      {/* ── QUICK PROMPTS ── */}
      <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 2 }}>
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => { setInput(p); inputRef.current?.focus(); }}
            style={{
              padding: "8px 16px", borderRadius: 99, fontSize: 12, fontWeight: 500,
              background: "var(--bg-elevated)", border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.5)", cursor: "pointer", whiteSpace: "nowrap",
              flexShrink: 0, transition: "all 0.12s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(10,132,255,0.5)";
              (e.currentTarget as HTMLElement).style.color = "#0a84ff";
              (e.currentTarget as HTMLElement).style.background = "rgba(10,132,255,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)";
              (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
            }}
          >{p}</button>
        ))}
      </div>

      {/* ── MESSAGES ── */}
      <div style={{
        borderRadius: 18, border: "1px solid rgba(255,255,255,0.07)",
        background: "var(--bg-elevated)", padding: "16px",
        minHeight: 220, maxHeight: 380, overflowY: "auto",
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        {messages.length === 0 && !isChatLoading ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "28px 0" }}>
            <span style={{ fontSize: 40 }}>🧘</span>
            <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.25)", textAlign: "center", lineHeight: 1.6 }}>
              Ask me anything about your finances.<br/>I know your numbers.
            </p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} style={{
              display: "flex", gap: 10,
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              animation: "msgIn 0.2s ease",
            }}>
              {m.role === "assistant" && (
                <div style={{
                  width: 30, height: 30, borderRadius: 9, flexShrink: 0, marginTop: 2,
                  background: "linear-gradient(135deg, #5e5ce6, #0a84ff)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
                }}>🧘</div>
              )}
              <div style={{
                maxWidth: "76%", padding: "11px 15px",
                borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: m.role === "user" ? "#0a84ff" : "rgba(255,255,255,0.06)",
                border: m.role === "user" ? "none" : "1px solid rgba(255,255,255,0.08)",
                fontSize: 13, lineHeight: 1.65,
                color: m.role === "user" ? "#fff" : "rgba(255,255,255,0.85)",
                whiteSpace: "pre-wrap", wordBreak: "break-word",
              }}>
                {m.content}
              </div>
            </div>
          ))
        )}
        {isChatLoading && (
          <div style={{ display: "flex", gap: 10, animation: "msgIn 0.2s ease" }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9, flexShrink: 0,
              background: "linear-gradient(135deg, #5e5ce6, #0a84ff)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
            }}>🧘</div>
            <div style={{ padding: "13px 16px", borderRadius: "16px 16px 16px 4px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", gap: 5 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.35)",
                    animation: `bounce 1.1s ease-in-out ${i * 0.18}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── INPUT ── */}
      <div style={{
        display: "flex", alignItems: "flex-end", gap: 10,
        background: "var(--bg-elevated)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18, padding: "12px 16px",
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask Guru anything…"
          rows={1}
          style={{
            flex: 1, resize: "none", background: "none", border: "none",
            fontSize: 14, color: "#fff", outline: "none",
            lineHeight: 1.5, fontFamily: "inherit", maxHeight: 100, overflowY: "auto",
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isChatLoading}
          style={{
            width: 36, height: 36, borderRadius: 10, fontSize: 18,
            background: input.trim() && !isChatLoading ? "#0a84ff" : "rgba(255,255,255,0.07)",
            color: "#fff", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "background 0.15s",
            boxShadow: input.trim() && !isChatLoading ? "0 4px 16px rgba(10,132,255,0.4)" : "none",
          }}
        >↑</button>
      </div>
    </div>
  );
}
