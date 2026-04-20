"use client";

import PageWrapper from "@/components/layout/PageWrapper";
import { useSettingsStore } from "@/store/settingsStore";

export default function SettingsPage() {
  const { theme, setTheme, geminiKey, setGeminiKey } = useSettingsStore();

  return (
    <PageWrapper title="Settings" subtitle="Configure your DevKit workspace">
      <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 560 }}>

        {/* Appearance */}
        <section>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>
            Appearance
          </h2>
          <div style={{ border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>Theme</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Switch between light and dark mode</p>
              </div>

              {/* Toggle */}
              <div style={{
                display: "flex", gap: 3,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 12, padding: 4,
              }}>
                {([
                  { value: "light", label: "☀️  Day" },
                  { value: "dark", label: "🌙  Night" },
                ] as const).map(({ value, label }) => {
                  const active = theme === value;
                  return (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      style={{
                        padding: "8px 20px", borderRadius: 9,
                        fontSize: 13, fontWeight: active ? 600 : 400,
                        cursor: "pointer", border: "none",
                        background: active ? "var(--accent)" : "transparent",
                        color: active ? "#ffffff" : "var(--text-muted)",
                        boxShadow: active ? "0 0 16px var(--accent-glow)" : "none",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* AI Keys */}
        <section>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>
            AI Configuration
          </h2>
          <div style={{ border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px" }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>
                Gemini API Key
              </p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
                Required for the weekly planner agent and finance chatbot. Get yours at aistudio.google.com
              </p>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIza••••••••••••••••••••••••••••••••••••••"
                style={{
                  width: "100%", padding: "11px 16px", borderRadius: 10,
                  border: "1px solid var(--border)", fontSize: 13,
                  color: "var(--text-primary)", background: "var(--bg-elevated)", outline: "none",
                  fontFamily: "monospace",
                }}
                onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
                onBlur={(e)  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
              />
            </div>
            <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", background: "var(--bg-hover)" }}>
              <button
                onClick={() => alert("Key saved!")}
                style={{
                  padding: "9px 22px", borderRadius: 9, border: "none",
                  background: "var(--accent)", color: "#fff",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  boxShadow: "0 0 16px var(--accent-glow)",
                }}
              >
                Save Key
              </button>
            </div>
          </div>
        </section>

        {/* Account */}
        <section>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>
            Account
          </h2>
          <div style={{ border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>Data</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Your data is stored locally on this machine only</p>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600, color: "var(--easy)",
                background: "var(--easy-bg)", padding: "4px 12px", borderRadius: 99,
              }}>Private</span>
            </div>
          </div>
        </section>

      </div>
    </PageWrapper>
  );
}
