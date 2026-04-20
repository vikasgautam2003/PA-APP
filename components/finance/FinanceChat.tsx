"use client";

import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "@/types";

interface Props {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (text: string) => Promise<void>;
  onClear: () => void;
}

const SUGGESTIONS = [
  "How can I save more this month?",
  "Which expense should I cut first?",
  "How long to reach my savings goal?",
  "Am I spending too much on food?",
];

export default function FinanceChat({ messages, isLoading, onSend, onClear }: Props) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    await onSend(text);
  }

  return (
    <div style={{
      border: "1px solid var(--border)", borderRadius: 16,
      background: "var(--bg-elevated)", overflow: "hidden",
      display: "flex", flexDirection: "column", height: "100%",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            Finance AI
          </h3>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
            Powered by Gemini · knows your finances
          </p>
        </div>
        <button onClick={onClear} style={{
          padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 500,
          cursor: "pointer", border: "1px solid var(--border)",
          background: "transparent", color: "var(--text-muted)",
        }}>Clear</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 8 }}>
            <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginBottom: 8 }}>
              Ask anything about your finances
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => onSend(s)} style={{
                  padding: "10px 14px", borderRadius: 10, fontSize: 12,
                  cursor: "pointer", border: "1px solid var(--border)",
                  background: "var(--bg-hover)", color: "var(--text-secondary)",
                  textAlign: "left", transition: "all 0.15s",
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}>
              <div style={{
                maxWidth: "85%", padding: "10px 14px",
                fontSize: 13, lineHeight: 1.6,
                background: msg.role === "user"
                  ? "var(--accent)"
                  : "var(--bg-hover)",
                color: msg.role === "user" ? "#fff" : "var(--text-primary)",
                border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
                borderRadius: msg.role === "user"
                  ? "12px 12px 2px 12px"
                  : "12px 12px 12px 2px",
              }}>
                {msg.content}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              padding: "12px 16px", borderRadius: "12px 12px 12px 2px",
              background: "var(--bg-hover)", border: "1px solid var(--border)",
              display: "flex", gap: 5, alignItems: "center",
            }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "var(--text-muted)",
                  animation: `bounce 1.2s ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "14px 16px", borderTop: "1px solid var(--border)",
        display: "flex", gap: 10, flexShrink: 0,
        background: "var(--bg-hover)",
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Ask about your finances..."
          style={{
            flex: 1, padding: "10px 16px", borderRadius: 10,
            border: "1px solid var(--border)", fontSize: 13,
            color: "var(--text-primary)", background: "var(--bg-elevated)",
            outline: "none",
          }}
          onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
          onBlur={(e)  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
        />
        <button onClick={handleSend} disabled={!input.trim() || isLoading} style={{
          padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600,
          cursor: !input.trim() || isLoading ? "not-allowed" : "pointer",
          border: "none",
          background: !input.trim() || isLoading ? "var(--border)" : "var(--accent)",
          color: !input.trim() || isLoading ? "var(--text-muted)" : "#fff",
          boxShadow: !input.trim() || isLoading ? "none" : "0 0 12px var(--accent-glow)",
          transition: "all 0.15s",
        }}>Send</button>
      </div>
    </div>
  );
}