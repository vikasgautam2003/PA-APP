"use client";

import { useEffect } from "react";
import { useErrorStore, reportError } from "@/store/errorStore";

function fmt(args: unknown[]): string {
  return args
    .map((a) => {
      if (a instanceof Error) return a.message;
      if (typeof a === "string") return a;
      try { return JSON.stringify(a); } catch { return String(a); }
    })
    .join(" ")
    .trim();
}

function relTime(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export default function ErrorToaster() {
  const { errors, minimized, dismiss, clear, setMinimized } = useErrorStore();

  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      reportError(e.message || "Script error", e.filename ? `${e.filename}:${e.lineno}` : undefined);
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const r = e.reason;
      reportError(r instanceof Error ? r.message : fmt([r]) || "Unhandled promise rejection");
    };

    // Mirror console.error into the toaster (catches the app's logged failures),
    // while still logging to the real console. Guard against recursion.
    const origError = console.error.bind(console);
    let inside = false;
    console.error = (...args: unknown[]) => {
      origError(...args);
      if (inside) return;
      inside = true;
      try {
        const msg = fmt(args);
        // Skip noisy React/Next dev warnings that aren't actionable app errors.
        if (msg && !/^Warning:/.test(msg) && !msg.includes("React DevTools")) {
          reportError(msg);
        }
      } finally {
        inside = false;
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      console.error = origError;
    };
  }, []);

  if (errors.length === 0) return null;

  const total = errors.reduce((a, e) => a + e.count, 0);

  // Minimized → small red tab pinned to the right edge.
  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        title="Show errors"
        style={{
          position: "fixed", right: 0, top: "50%", transform: "translateY(-50%)",
          zIndex: 9999,
          display: "flex", alignItems: "center", gap: 7,
          padding: "10px 12px",
          borderRadius: "10px 0 0 10px",
          border: "1px solid #ef4444", borderRight: "none",
          background: "#7f1d1d", color: "#fff",
          fontSize: 12, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 6px 22px rgba(0,0,0,0.4)",
          writingMode: "vertical-rl",
        }}
      >
        <span style={{ writingMode: "horizontal-tb" }}>⚠</span>
        {errors.length} {errors.length === 1 ? "error" : "errors"}
      </button>
    );
  }

  return (
    <div style={{
      position: "fixed", right: 16, bottom: 16, zIndex: 9999,
      width: 370, maxWidth: "calc(100vw - 32px)",
      display: "flex", flexDirection: "column", gap: 8,
      maxHeight: "calc(100vh - 32px)",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 12px", borderRadius: 10,
        background: "#450a0a", border: "1px solid #ef4444",
        color: "#fecaca", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
      }}>
        <span>⚠ {errors.length} {errors.length === 1 ? "issue" : "issues"}{total > errors.length ? ` · ${total} events` : ""}</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setMinimized(true)} style={hdrBtn} title="Minimise to side">—</button>
          <button onClick={clear} style={hdrBtn} title="Dismiss all">Clear all</button>
        </div>
      </div>

      {/* Cards (scrollable if many) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" }}>
        {errors.map((e) => (
          <div key={e.id} style={{
            border: "1px solid #ef4444",
            background: "linear-gradient(135deg, #450a0a 0%, #1c0a0a 100%)",
            borderRadius: 12, padding: "12px 14px",
            boxShadow: "0 8px 26px rgba(0,0,0,0.45)",
            animation: "err-slide-in 0.22s cubic-bezier(0.22,1,0.36,1)",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase",
                    color: "#fca5a5",
                  }}>
                    Error
                  </span>
                  {e.count > 1 && (
                    <span style={{
                      fontSize: 10, fontWeight: 800, color: "#fff",
                      background: "#ef4444", borderRadius: 999, padding: "1px 7px",
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      ×{e.count}
                    </span>
                  )}
                  <span style={{ fontSize: 10, color: "#fca5a580", marginLeft: "auto" }}>{relTime(e.lastTs)}</span>
                </div>
                <p style={{
                  fontSize: 12.5, lineHeight: 1.5, color: "#fee2e2",
                  wordBreak: "break-word",
                  display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                  {e.message}
                </p>
                {e.detail && (
                  <p style={{ fontSize: 11, color: "#fca5a5", marginTop: 4, wordBreak: "break-word" }}>{e.detail}</p>
                )}
              </div>
              <button onClick={() => dismiss(e.id)} title="Dismiss" style={{
                flexShrink: 0,
                width: 24, height: 24, borderRadius: 7,
                border: "1px solid #ef444455", background: "transparent",
                color: "#fca5a5", fontSize: 13, cursor: "pointer", lineHeight: 1,
              }}>
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes err-slide-in {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

const hdrBtn: React.CSSProperties = {
  border: "1px solid #ef444466", background: "transparent",
  color: "#fecaca", fontSize: 10, fontWeight: 700,
  borderRadius: 6, padding: "3px 8px", cursor: "pointer",
};
