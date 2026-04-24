"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { login, signup } from "@/lib/auth";

// ── Splash Screen ──────────────────────────────────────────────────────────────
function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"logo" | "slogan" | "fade">("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("slogan"), 900);
    const t2 = setTimeout(() => setPhase("fade"),   2400);
    const t3 = setTimeout(() => onDone(),            3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "#060608",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 28,
      opacity: phase === "fade" ? 0 : 1,
      transition: phase === "fade" ? "opacity 0.7s cubic-bezier(0.4,0,0.2,1)" : "none",
      pointerEvents: "none",
    }}>
      {/* Background orbs */}
      <div style={{
        position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none",
      }}>
        <div style={{
          position: "absolute", top: "-20%", right: "-10%",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, #2563eb18 0%, transparent 70%)",
          animation: "orbFloat 4s ease-in-out infinite alternate",
        }} />
        <div style={{
          position: "absolute", bottom: "-20%", left: "-10%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, #7c3aed12 0%, transparent 70%)",
          animation: "orbFloat 5s ease-in-out infinite alternate-reverse",
        }} />
      </div>

      {/* Logo */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
        opacity: phase === "logo" || phase === "slogan" || phase === "fade" ? 1 : 0,
        transform: phase === "logo" ? "scale(0.8) translateY(10px)" : "scale(1) translateY(0)",
        transition: "opacity 0.8s cubic-bezier(0.34,1.56,0.64,1), transform 0.8s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {/* Icon */}
        <div style={{
          width: 96, height: 96, borderRadius: 28,
          background: "linear-gradient(135deg, #2563eb, #7c3aed)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 80px #2563eb50, 0 0 160px #7c3aed20, 0 20px 60px rgba(0,0,0,0.5)",
          animation: "logoPulse 3s ease-in-out infinite",
          position: "relative", overflow: "hidden",
        }}>
          {/* Shine overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)",
            borderRadius: 28,
          }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.png"
            alt="Ares"
            style={{ width: 60, height: 60, objectFit: "contain", position: "relative", zIndex: 1 }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span style={{
            position: "absolute", fontSize: 42, fontWeight: 900, color: "#fff",
            letterSpacing: "-0.05em",
          }}>A</span>
        </div>

        {/* App name */}
        <div style={{ textAlign: "center" }}>
          <h1 style={{
            fontSize: 48, fontWeight: 900, color: "#ffffff",
            letterSpacing: "-0.04em", lineHeight: 1,
            background: "linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Ares
          </h1>
        </div>
      </div>

      {/* Slogan */}
      <div style={{
        textAlign: "center",
        opacity: phase === "slogan" || phase === "fade" ? 1 : 0,
        transform: phase === "slogan" || phase === "fade" ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}>
        <p style={{
          fontSize: 15, color: "#4b5563", fontWeight: 400,
          letterSpacing: "0.01em", lineHeight: 1.6,
        }}>
          Making your professional life
        </p>
        <p style={{
          fontSize: 15, fontWeight: 600,
          background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "0.01em",
        }}>
          a little more structured.
        </p>
      </div>

      {/* Bottom loading bar */}
      <div style={{
        position: "absolute", bottom: 48,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
      }}>
        <div style={{
          width: 120, height: 2, background: "#18181c", borderRadius: 99, overflow: "hidden",
        }}>
          <div style={{
            height: "100%", borderRadius: 99,
            background: "linear-gradient(90deg, #2563eb, #7c3aed)",
            animation: "loadBar 2.4s cubic-bezier(0.4,0,0.2,1) forwards",
          }} />
        </div>
      </div>

      <style>{`
        @keyframes logoPulse {
          0%, 100% { box-shadow: 0 0 80px #2563eb50, 0 0 160px #7c3aed20, 0 20px 60px rgba(0,0,0,0.5); }
          50%       { box-shadow: 0 0 120px #2563eb70, 0 0 200px #7c3aed30, 0 20px 60px rgba(0,0,0,0.5); }
        }
        @keyframes orbFloat {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, -20px) scale(1.05); }
        }
        @keyframes loadBar {
          0%   { width: 0%; }
          20%  { width: 15%; }
          50%  { width: 45%; }
          75%  { width: 72%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}

// ── Auth Page ──────────────────────────────────────────────────────────────────
export default function AuthPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [visible,    setVisible]    = useState(false);
  const [mode,       setMode]       = useState<"login" | "signup">("login");
  const [username,   setUsername]   = useState("");
  const [password,   setPassword]   = useState("");
  const [error,      setError]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const { setUser }                 = useAuthStore();

  function handleSplashDone() {
    setShowSplash(false);
    setTimeout(() => setVisible(true), 100);
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      const user = mode === "login"
        ? await login(username, password)
        : await signup(username, password);
      setUser(user, { user_id: user.id, username: user.username, token: crypto.randomUUID() });
    } catch (e) {
      setError(typeof e === "string" ? e : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {showSplash && <SplashScreen onDone={handleSplashDone} />}

      {/* Auth form */}
      <div style={{
        minHeight: "100vh", background: "#060608",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24, position: "relative", overflow: "hidden",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}>

        {/* Background orbs */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{
            position: "absolute", top: "-15%", right: "-5%",
            width: 500, height: 500, borderRadius: "50%",
            background: "radial-gradient(circle, #2563eb14 0%, transparent 70%)",
          }} />
          <div style={{
            position: "absolute", bottom: "-15%", left: "-5%",
            width: 400, height: 400, borderRadius: "50%",
            background: "radial-gradient(circle, #7c3aed10 0%, transparent 70%)",
          }} />
          {/* Grid lines */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }} />
        </div>

        {/* Card */}
        <div style={{
          width: "100%", maxWidth: 400, position: "relative",
        }}>
          {/* Logo + name */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 16, marginBottom: 40,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 40px #2563eb40, 0 8px 32px rgba(0,0,0,0.4)",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)",
              }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.png" alt="Ares"
                style={{ width: 40, height: 40, objectFit: "contain", position: "relative", zIndex: 1 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <span style={{ position: "absolute", fontSize: 28, fontWeight: 900, color: "#fff" }}>A</span>
            </div>

            <div style={{ textAlign: "center" }}>
              <h1 style={{
                fontSize: 32, fontWeight: 900, letterSpacing: "-0.04em",
                background: "linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                marginBottom: 6,
              }}>Ares</h1>
              <p style={{ fontSize: 13, color: "#4b5563", fontWeight: 400 }}>
                Making your professional life a little more structured.
              </p>
            </div>
          </div>

          {/* Form card */}
          <div style={{
            background: "rgba(14,14,18,0.8)",
            border: "1px solid #1f1f28",
            borderRadius: 24, padding: "32px 32px 28px",
            backdropFilter: "blur(20px)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}>

            {/* Tab switcher */}
            <div style={{
              display: "flex", gap: 2,
              background: "#0a0a0e", borderRadius: 12,
              padding: 4, marginBottom: 28,
              border: "1px solid #18181c",
            }}>
              {(["login", "signup"] as const).map((m) => (
                <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
                  flex: 1, padding: "9px 0", borderRadius: 9,
                  fontSize: 13, fontWeight: mode === m ? 700 : 400,
                  cursor: "pointer", border: "none",
                  background: mode === m
                    ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                    : "transparent",
                  color: mode === m ? "#fff" : "#4b5563",
                  boxShadow: mode === m ? "0 0 20px #2563eb40" : "none",
                  transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
                  textTransform: "capitalize",
                }}>{m === "login" ? "Sign In" : "Sign Up"}</button>
              ))}
            </div>

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#4b5563", display: "block", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="vikas"
                  style={{
                    width: "100%", padding: "12px 16px",
                    borderRadius: 12, fontSize: 14,
                    border: "1px solid #1f1f28",
                    background: "#0a0a0e",
                    color: "#f0f0f0",
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px #2563eb20"; }}
                  onBlur={(e)  => { e.target.style.borderColor = "#1f1f28"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#4b5563", display: "block", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="••••••••"
                  style={{
                    width: "100%", padding: "12px 16px",
                    borderRadius: 12, fontSize: 14,
                    border: "1px solid #1f1f28",
                    background: "#0a0a0e",
                    color: "#f0f0f0",
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px #2563eb20"; }}
                  onBlur={(e)  => { e.target.style.borderColor = "#1f1f28"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  padding: "10px 14px", borderRadius: 10, fontSize: 12,
                  color: "#f87171", background: "#dc262610",
                  border: "1px solid #dc262630",
                }}>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading || !username || !password}
                style={{
                  width: "100%", padding: "13px",
                  borderRadius: 12, fontSize: 14, fontWeight: 700,
                  cursor: loading || !username || !password ? "not-allowed" : "pointer",
                  border: "none", marginTop: 4,
                  background: loading || !username || !password
                    ? "#18181c"
                    : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  color: loading || !username || !password ? "#374151" : "#fff",
                  boxShadow: loading || !username || !password
                    ? "none"
                    : "0 0 24px #2563eb50, 0 4px 16px rgba(0,0,0,0.3)",
                  transition: "all 0.2s ease",
                  letterSpacing: "-0.01em",
                }}
              >
                {loading ? "Please wait…" : mode === "login" ? "Sign In to Ares" : "Create Account"}
              </button>
            </div>

            {/* Footer note */}
            {mode === "signup" && (
              <p style={{ fontSize: 11, color: "#374151", textAlign: "center", marginTop: 18, lineHeight: 1.6 }}>
                🔒 Your data stays on this machine only. No cloud, no sync.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
