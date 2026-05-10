"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { FdeDay, FdeChatMessage, FdeImageResult, FdeVideoResult } from "@/types";
import { useFdeChat } from "@/hooks/useFdeChat";
import { useSettingsStore } from "@/store/settingsStore";

interface Props {
  day: FdeDay | undefined;
  open: boolean;
  onToggle: () => void;
}

export default function ChatPanel({ day, open, onToggle }: Props) {
  // Lock body scroll when overlay is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onToggle(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onToggle]);

  return (
    <>
      <Orb open={open} onClick={onToggle} />
      {open && <Overlay day={day} onClose={onToggle} />}
    </>
  );
}

// ─────────────────────────── Orb ───────────────────────────

function Orb({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={open ? "Close" : "Ask AI about this day"}
      style={{
        position: "fixed",
        bottom: 28, right: 28,
        width: 64, height: 64,
        borderRadius: "50%",
        border: "none", padding: 0,
        cursor: "pointer",
        background: "transparent",
        zIndex: 60,
        transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: open ? "scale(0.85)" : "scale(1)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = open ? "scale(0.92)" : "scale(1.08)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = open ? "scale(0.85)" : "scale(1)"; }}
    >
      {/* Outer halo */}
      <span style={{
        position: "absolute", inset: -10,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(168,85,247,0.45) 0%, rgba(10,132,255,0.25) 40%, transparent 70%)",
        filter: "blur(8px)",
        animation: "fde-orb-halo 3.6s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      {/* Conic gradient ring */}
      <span style={{
        position: "absolute", inset: 0,
        borderRadius: "50%",
        background: "conic-gradient(from 0deg, #0a84ff, #a855f7, #ec4899, #f59e0b, #34d399, #0a84ff)",
        animation: "fde-orb-spin 6s linear infinite",
        boxShadow: "0 12px 36px rgba(168,85,247,0.45), 0 4px 14px rgba(10,132,255,0.4)",
      }} />
      {/* Inner glass */}
      <span style={{
        position: "absolute", inset: 4,
        borderRadius: "50%",
        background: "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18) 0%, rgba(0,0,0,0.55) 75%)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, color: "#fff",
        textShadow: "0 0 12px rgba(255,255,255,0.6)",
      }}>
        {open ? "✕" : "✦"}
      </span>
    </button>
  );
}

// ─────────────────────────── Overlay ───────────────────────────

function Overlay({ day, onClose }: { day: FdeDay | undefined; onClose: () => void }) {
  const { messages, sending, error, sendMessage, clearThread } = useFdeChat(day);
  const { groqKey, serpapiKey } = useSettingsStore();
  const [input, setInput] = useState("");
  const [useWeb, setUseWeb] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function onSend() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    await sendMessage(text, useWeb && !!serpapiKey);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        animation: "fde-fade-in 0.25s ease",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "32px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(1180px, 96vw)",
          height: "min(880px, 92vh)",
          borderRadius: 24,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          overflow: "hidden",
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
          boxShadow: "0 40px 120px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04)",
          animation: "fde-overlay-in 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Header */}
        <header style={{
          padding: "18px 24px",
          borderBottom: "1px solid var(--border-subtle)",
          background: "linear-gradient(135deg, rgba(168,85,247,0.10) 0%, rgba(10,132,255,0.06) 50%, transparent 100%)",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
            <span style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "conic-gradient(from 0deg, #0a84ff, #a855f7, #ec4899, #f59e0b, #34d399, #0a84ff)",
              animation: "fde-orb-spin 6s linear infinite",
              flexShrink: 0,
              boxShadow: "0 4px 16px rgba(168,85,247,0.4)",
            }} />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent-text)", marginBottom: 2 }}>
                Tutor · Day {day ? String(day.day).padStart(2, "0") : "—"}
              </p>
              <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {day?.kind === "rest" ? "Rest day" : day?.kind === "capstone" ? "Capstone" : day?.topic ?? ""}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {messages.length > 0 && (
              <button onClick={clearThread} title="Clear thread" style={iconBtn}>↺</button>
            )}
            <button onClick={onClose} title="Close (Esc)" style={iconBtn}>✕</button>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} style={{
          overflowY: "auto",
          padding: "24px 28px",
          display: "flex", flexDirection: "column", gap: 22,
        }}>
          {!groqKey && (
            <Notice tone="warn">Add a Groq key in Settings to chat.</Notice>
          )}
          {!serpapiKey && groqKey && messages.length === 0 && (
            <Notice tone="info">Add a SerpAPI key in Settings to enable web search with images and videos.</Notice>
          )}
          {messages.length === 0 && groqKey && (
            <EmptyState dayTopic={day?.topic} />
          )}
          {messages.map((m) => <Bubble key={m.id} msg={m} />)}
          {sending && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", color: "var(--text-muted)", fontSize: 13 }}>
              <span style={{ ...dotStyle, animationDelay: "0ms" }} />
              <span style={{ ...dotStyle, animationDelay: "180ms" }} />
              <span style={{ ...dotStyle, animationDelay: "360ms" }} />
              <span style={{ marginLeft: 8 }}>{useWeb ? "Searching the web…" : "Thinking…"}</span>
            </div>
          )}
          {error && <Notice tone="error">{error}</Notice>}
        </div>

        {/* Composer */}
        <div style={{
          padding: "16px 22px 20px",
          borderTop: "1px solid var(--border-subtle)",
          background: "var(--bg-surface)",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void onSend();
              }
            }}
            placeholder={day ? `Ask anything about ${day.kind === "lesson" ? day.topic ?? "this day" : "this day"}…` : "Ask…"}
            rows={2}
            style={{
              width: "100%", padding: "12px 14px",
              borderRadius: 14, border: "1px solid var(--border)",
              background: "var(--bg-elevated)", color: "var(--text-primary)",
              fontSize: 14, fontFamily: "inherit", lineHeight: 1.55,
              outline: "none", resize: "none",
              transition: "border-color 0.18s, box-shadow 0.18s",
            }}
            onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 4px var(--accent-glow)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <button
              onClick={() => setUseWeb((v) => !v)}
              disabled={!serpapiKey}
              title={serpapiKey ? "Toggle web search (text + images + videos)" : "Add SerpAPI key in Settings"}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 14px", borderRadius: 999,
                border: useWeb && serpapiKey ? "1px solid var(--accent)" : "1px solid var(--border)",
                background: useWeb && serpapiKey
                  ? "linear-gradient(135deg, var(--accent-glow), rgba(168,85,247,0.12))"
                  : "transparent",
                color: useWeb && serpapiKey ? "var(--accent-text)" : serpapiKey ? "var(--text-secondary)" : "var(--text-faint)",
                fontSize: 12, fontWeight: 600, letterSpacing: "0.02em",
                cursor: serpapiKey ? "pointer" : "not-allowed",
                transition: "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <span style={{ fontSize: 13 }}>◎</span>
              Web · images · videos {useWeb && serpapiKey ? "ON" : ""}
            </button>
            <button
              onClick={() => void onSend()}
              disabled={!input.trim() || sending || !groqKey}
              style={{
                padding: "10px 22px", borderRadius: 999, border: "none",
                background: !input.trim() || sending || !groqKey
                  ? "var(--bg-hover)"
                  : "linear-gradient(135deg, var(--accent), #a855f7)",
                color: !input.trim() || sending || !groqKey ? "var(--text-faint)" : "#fff",
                fontSize: 13, fontWeight: 700, letterSpacing: "0.04em",
                cursor: !input.trim() || sending || !groqKey ? "not-allowed" : "pointer",
                boxShadow: !input.trim() || sending || !groqKey ? "none" : "0 6px 20px var(--accent-glow)",
                transition: "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              Ask ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── Empty state ───────────────────────────

function EmptyState({ dayTopic }: { dayTopic?: string }) {
  const suggestions = dayTopic ? [
    `Explain ${dayTopic} with a worked example`,
    `What are the most common mistakes with ${dayTopic}?`,
    `Show me a video tutorial on ${dayTopic}`,
    `How does ${dayTopic} work under the hood?`,
  ] : [];
  return (
    <div style={{ padding: "60px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: "conic-gradient(from 0deg, #0a84ff, #a855f7, #ec4899, #f59e0b, #34d399, #0a84ff)",
        animation: "fde-orb-spin 6s linear infinite",
        boxShadow: "0 0 60px rgba(168,85,247,0.45)",
      }} />
      <div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 6 }}>
          What do you want to learn?
        </h3>
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, maxWidth: 460, margin: "0 auto" }}>
          I&apos;ll explain anything about today&apos;s topic. Toggle web search for current sources, video tutorials, and reference images.
        </p>
      </div>
      {suggestions.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 720 }}>
          {suggestions.map((s) => (
            <span key={s} style={{
              fontSize: 12, padding: "8px 14px", borderRadius: 999,
              border: "1px solid var(--border)", background: "var(--bg-surface)",
              color: "var(--text-secondary)",
            }}>{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────── Bubble ───────────────────────────

function Bubble({ msg }: { msg: FdeChatMessage }) {
  const isUser = msg.role === "user";
  const hasMedia = !isUser && (msg.sources.images.length > 0 || msg.sources.videos.length > 0 || msg.sources.web.length > 0);

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: isUser ? "flex-end" : "flex-start",
      gap: 12,
      animation: "fde-fade-up 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
    }}>
      <div style={{
        maxWidth: isUser ? "78%" : "92%",
        padding: isUser ? "12px 16px" : "16px 20px",
        borderRadius: 16,
        borderBottomRightRadius: isUser ? 6 : 16,
        borderBottomLeftRadius: isUser ? 16 : 6,
        background: isUser
          ? "linear-gradient(135deg, var(--accent), #7c3aed)"
          : "var(--bg-surface)",
        color: isUser ? "#fff" : "var(--text-primary)",
        border: isUser ? "none" : "1px solid var(--border)",
        fontSize: 14, lineHeight: 1.7,
        boxShadow: isUser ? "0 4px 18px var(--accent-glow)" : "none",
      }}>
        <ReactMarkdown
          components={{
            p: ({ children }) => <p style={{ margin: "0 0 10px", lineHeight: 1.7 }}>{children}</p>,
            strong: ({ children }) => <strong style={{ fontWeight: 700, color: isUser ? "#fff" : "var(--text-primary)" }}>{children}</strong>,
            em: ({ children }) => <em style={{ fontStyle: "italic", opacity: 0.9 }}>{children}</em>,
            ul: ({ children }) => <ul style={{ paddingLeft: 22, margin: "8px 0 12px", listStyle: "disc" }}>{children}</ul>,
            ol: ({ children }) => <ol style={{ paddingLeft: 22, margin: "8px 0 12px" }}>{children}</ol>,
            li: ({ children }) => <li style={{ marginBottom: 5, lineHeight: 1.65 }}>{children}</li>,
            h1: ({ children }) => <h2 style={{ fontSize: 17, fontWeight: 700, margin: "14px 0 8px", letterSpacing: "-0.01em" }}>{children}</h2>,
            h2: ({ children }) => <h3 style={{ fontSize: 15, fontWeight: 700, margin: "12px 0 6px", letterSpacing: "-0.01em" }}>{children}</h3>,
            h3: ({ children }) => <h4 style={{ fontSize: 13.5, fontWeight: 700, margin: "10px 0 5px", color: isUser ? "#fff" : "var(--accent-text)" }}>{children}</h4>,
            hr: () => <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "12px 0" }} />,
            a: ({ children, href }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" style={{
                color: isUser ? "#fff" : "var(--accent-text)",
                textDecoration: "underline", textUnderlineOffset: 2,
              }}>{children}</a>
            ),
            code: ({ children, className }) => {
              const isBlock = !!className?.includes("language-");
              if (isBlock) {
                return (
                  <pre style={{
                    margin: "10px 0", padding: "14px 16px",
                    borderRadius: 10,
                    background: isUser ? "rgba(0,0,0,0.30)" : "var(--bg-hover)",
                    color: isUser ? "#fff" : "var(--text-primary)",
                    fontSize: 12.5, lineHeight: 1.6,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    overflowX: "auto",
                    border: isUser ? "1px solid rgba(255,255,255,0.18)" : "1px solid var(--border)",
                  }}>
                    <code>{children}</code>
                  </pre>
                );
              }
              return (
                <code style={{
                  fontSize: 12.5,
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  background: isUser ? "rgba(255,255,255,0.18)" : "var(--accent-glow)",
                  color: isUser ? "#fff" : "var(--accent-text)",
                  padding: "1.5px 7px", borderRadius: 6,
                }}>{children}</code>
              );
            },
            blockquote: ({ children }) => (
              <blockquote style={{
                borderLeft: `3px solid ${isUser ? "rgba(255,255,255,0.5)" : "var(--accent)"}`,
                paddingLeft: 12, margin: "8px 0",
                color: isUser ? "rgba(255,255,255,0.85)" : "var(--text-secondary)",
              }}>{children}</blockquote>
            ),
            table: ({ children }) => (
              <div style={{ overflowX: "auto", margin: "10px 0" }}>
                <table style={{ borderCollapse: "collapse", fontSize: 12.5 }}>{children}</table>
              </div>
            ),
            th: ({ children }) => <th style={{ border: "1px solid var(--border)", padding: "6px 10px", textAlign: "left", background: "var(--bg-hover)" }}>{children}</th>,
            td: ({ children }) => <td style={{ border: "1px solid var(--border)", padding: "6px 10px" }}>{children}</td>,
          }}
        >
          {msg.content}
        </ReactMarkdown>
      </div>

      {hasMedia && (
        <div style={{ width: "92%", display: "flex", flexDirection: "column", gap: 14 }}>
          {msg.sources.videos.length > 0 && <VideoStrip videos={msg.sources.videos} />}
          {msg.sources.images.length > 0 && <ImageStrip images={msg.sources.images} />}
          {msg.sources.web.length > 0 && <WebStrip web={msg.sources.web} />}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────── Media strips ───────────────────────────

function VideoStrip({ videos }: { videos: FdeVideoResult[] }) {
  return (
    <section>
      <p style={stripLabel}>▶ Videos</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
        {videos.map((v, i) => (
          <a
            key={i}
            href={v.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", flexDirection: "column",
              borderRadius: 12, border: "1px solid var(--border)",
              background: "var(--bg-surface)", textDecoration: "none",
              overflow: "hidden",
              transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.boxShadow = "0 8px 24px var(--accent-glow)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ position: "relative", aspectRatio: "16/9", background: "var(--bg-hover)" }}>
              {v.thumbnail && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={v.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
              <span style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.5) 100%)",
              }}>
                <span style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: "rgba(255,255,255,0.92)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#0a84ff", fontSize: 14,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                }}>▶</span>
              </span>
              {v.duration && (
                <span style={{
                  position: "absolute", bottom: 6, right: 6,
                  fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                  background: "rgba(0,0,0,0.78)", color: "#fff",
                  fontVariantNumeric: "tabular-nums",
                }}>{v.duration}</span>
              )}
            </div>
            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
              <p style={{
                fontSize: 12, fontWeight: 600, color: "var(--text-primary)",
                lineHeight: 1.4,
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>{v.title}</p>
              <p style={{
                fontSize: 10.5, color: "var(--text-muted)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {v.channel}{v.channel && v.date ? " · " : ""}{v.date}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function ImageStrip({ images }: { images: FdeImageResult[] }) {
  return (
    <section>
      <p style={stripLabel}>◇ Images</p>
      <div style={{
        display: "flex", gap: 8, overflowX: "auto",
        paddingBottom: 4,
      }}>
        {images.map((img, i) => (
          <a
            key={i}
            href={img.link}
            target="_blank"
            rel="noopener noreferrer"
            title={img.title || img.source}
            style={{
              flexShrink: 0,
              width: 130, height: 130, borderRadius: 10,
              border: "1px solid var(--border)",
              overflow: "hidden", position: "relative",
              transition: "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.borderColor = "var(--accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.thumbnail} alt={img.title || ""} style={{
              width: "100%", height: "100%", objectFit: "cover",
              display: "block",
            }} />
            {img.source && (
              <span style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                padding: "4px 6px",
                fontSize: 9, fontWeight: 600, color: "#fff",
                background: "linear-gradient(0deg, rgba(0,0,0,0.85), transparent)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{img.source}</span>
            )}
          </a>
        ))}
      </div>
    </section>
  );
}

function WebStrip({ web }: { web: import("@/types").FdeWebResult[] }) {
  return (
    <section>
      <p style={stripLabel}>◐ Sources</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {web.map((w, i) => (
          <a
            key={i}
            href={w.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block", padding: "10px 12px",
              borderRadius: 10, border: "1px solid var(--border)",
              background: "var(--bg-surface)", textDecoration: "none",
              transition: "all 0.18s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.transform = "translateX(2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateX(0)"; }}
          >
            <p style={{ fontSize: 11.5, fontWeight: 600, color: "var(--accent-text)", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              [W{i + 1}] {w.title}
            </p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {w.snippet}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────── Misc ───────────────────────────

const stripLabel: React.CSSProperties = {
  fontSize: 9, fontWeight: 700, letterSpacing: "0.2em",
  textTransform: "uppercase", color: "var(--text-muted)",
  marginBottom: 8,
};

const iconBtn: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--bg-surface)", color: "var(--text-secondary)",
  fontSize: 13, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  transition: "all 0.18s",
};

const dotStyle: React.CSSProperties = {
  width: 8, height: 8, borderRadius: "50%",
  background: "linear-gradient(135deg, var(--accent), #a855f7)",
  animation: "fde-bounce 1.2s infinite ease-in-out",
};

function Notice({ tone, children }: { tone: "warn" | "error" | "info"; children: React.ReactNode }) {
  const palette = tone === "error"
    ? { c: "var(--hard)", bg: "var(--hard-bg)" }
    : tone === "info"
    ? { c: "var(--accent-text)", bg: "var(--accent-glow)" }
    : { c: "var(--medium)", bg: "var(--medium-bg)" };
  return (
    <div style={{
      padding: "12px 14px", borderRadius: 12,
      background: palette.bg, color: palette.c,
      fontSize: 12.5, lineHeight: 1.55,
      border: `1px solid ${palette.c}`,
    }}>{children}</div>
  );
}
