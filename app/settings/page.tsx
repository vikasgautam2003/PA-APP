"use client";

import { useState, useEffect } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { buildGmailAuthUrl, exchangeCodeForTokens } from "@/lib/gmail";

export default function SettingsPage() {
  const {
    theme, setTheme,
    groqKey, setGroqKey,
    serpapiKey, setSerpapiKey,
    gmailToken, gmailClientId, gmailClientSecret,
    setGmailCredentials, setGmailTokens, clearGmail,
    notifEnabled, setNotifEnabled,
    notifMeetingAlert, setNotifMeetingAlert,
    notifDsaNudgeTime, setNotifDsaNudgeTime,
    notifBriefTime, setNotifBriefTime,
  } = useSettingsStore();

  const [groqSaved,    setGroqSaved]    = useState(false);
  const [serpapiSaved, setSerpapiSaved] = useState(false);
  const [clientId,     setClientId]     = useState(gmailClientId);
  const [clientSecret, setClientSecret] = useState(gmailClientSecret);
  const [connecting,   setConnecting]   = useState(false);
  const [gmailError,   setGmailError]   = useState("");
  const [exporting,    setExporting]    = useState(false);
  const [exportDone,   setExportDone]   = useState(false);
  const [importing,    setImporting]    = useState(false);
  const [importResult, setImportResult] = useState<{ count: number } | null>(null);
  const [importError,  setImportError]  = useState("");

  useEffect(() => {
    setClientId(gmailClientId);
    setClientSecret(gmailClientSecret);
  }, [gmailClientId, gmailClientSecret]);

  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    try {
      const { getDb } = await import("@/lib/db");
      const { useAuthStore } = await import("@/store/authStore");
      const db = await getDb();
      const uid = useAuthStore.getState().user?.id;
      const [notes, tasks, dsa, finance, transactions, prompts, planner] = await Promise.all([
        db.select("SELECT * FROM notes WHERE user_id = ?", [uid]),
        db.select("SELECT * FROM planner_subtopics WHERE user_id = ?", [uid]),
        db.select(`SELECT dq.*, dp.status, dp.user_notes, dp.solved_at FROM dsa_progress dp
                   JOIN dsa_questions dq ON dq.id = dp.question_id WHERE dp.user_id = ?`, [uid]),
        db.select("SELECT * FROM finances WHERE user_id = ?", [uid]),
        db.select("SELECT * FROM finance_transactions WHERE user_id = ?", [uid]),
        db.select("SELECT * FROM prompts WHERE user_id = ?", [uid]),
        db.select("SELECT * FROM planner_week_plans WHERE user_id = ?", [uid]),
      ]);
      const payload = { exportedAt: new Date().toISOString(), notes, tasks, dsa, finance, transactions, prompts, planner };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ares-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      setExporting(false);
    }
  }

  async function handleImport(file: File) {
    if (importing) return;
    setImporting(true);
    setImportError("");
    setImportResult(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const { getDb } = await import("@/lib/db");
      const { useAuthStore } = await import("@/store/authStore");
      const db = await getDb();
      const uid = useAuthStore.getState().user?.id;
      if (!uid) throw new Error("Not logged in");
      let count = 0;

      if (Array.isArray(data.notes)) {
        for (const n of data.notes) {
          await db.execute(
            `INSERT INTO notes (user_id, title, content, topic, color, pinned, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)`,
            [uid, n.title ?? "", n.content ?? "", n.topic ?? "", n.color ?? "default", n.pinned ?? 0, n.created_at, n.updated_at]
          );
          count++;
        }
      }

      if (Array.isArray(data.transactions)) {
        for (const t of data.transactions) {
          await db.execute(
            `INSERT INTO finance_transactions (user_id, amount, category, note, date, created_at) VALUES (?,?,?,?,?,?)`,
            [uid, t.amount, t.category, t.note ?? "", t.date, t.created_at]
          );
          count++;
        }
      }

      if (Array.isArray(data.finance) && data.finance.length > 0) {
        const f = data.finance[0];
        await db.execute(
          `INSERT OR REPLACE INTO finances (user_id, stipend, rent, food, transport, subscriptions, misc, savings_goal, target_date, currency) VALUES (?,?,?,?,?,?,?,?,?,?)`,
          [uid, f.stipend ?? 0, f.rent ?? 0, f.food ?? 0, f.transport ?? 0, f.subscriptions ?? 0, f.misc ?? 0, f.savings_goal ?? 0, f.target_date ?? null, f.currency ?? "₹"]
        );
        count++;
      }

      if (Array.isArray(data.prompts)) {
        for (const p of data.prompts) {
          await db.execute(
            `INSERT INTO prompts (user_id, title, body, tags, model_target, created_at, updated_at) VALUES (?,?,?,?,?,?,?)`,
            [uid, p.title, p.body, p.tags ?? "", p.model_target ?? "Any", p.created_at, p.updated_at]
          );
          count++;
        }
      }

      if (Array.isArray(data.tasks)) {
        for (const t of data.tasks) {
          await db.execute(
            `INSERT INTO planner_subtopics (topic_id, user_id, label, timestamp_raw, order_index, is_done, done_at, created_at) VALUES (?,?,?,?,?,?,?,?)`,
            [null, uid, t.label, t.timestamp_raw ?? "", t.order_index ?? 0, t.is_done ?? 0, t.done_at ?? null, t.created_at]
          );
          count++;
        }
      }

      if (Array.isArray(data.planner)) {
        for (const p of data.planner) {
          await db.execute(
            `INSERT OR REPLACE INTO planner_week_plans (user_id, week_start, plan_json, generated_at) VALUES (?,?,?,?)`,
            [uid, p.week_start, p.plan_json, p.generated_at]
          );
          count++;
        }
      }

      if (Array.isArray(data.dsa)) {
        for (const d of data.dsa) {
          const q = await db.select<{ id: number }[]>(`SELECT id FROM dsa_questions WHERE title = ?`, [d.title]);
          if (q.length > 0) {
            await db.execute(
              `INSERT OR REPLACE INTO dsa_progress (user_id, question_id, status, user_notes, solved_at) VALUES (?,?,?,?,?)`,
              [uid, q[0].id, d.status, d.user_notes ?? "", d.solved_at ?? null]
            );
            count++;
          }
        }
      }

      setImportResult({ count });
      setTimeout(() => setImportResult(null), 5000);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Invalid backup file.");
      setTimeout(() => setImportError(""), 5000);
    } finally {
      setImporting(false);
    }
  }

  async function handleConnectGmail() {
    if (!clientId || !clientSecret) {
      setGmailError("Enter your Client ID and Secret first.");
      return;
    }
    setGmailCredentials(clientId, clientSecret);
    setConnecting(true);
    setGmailError("");

    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const { once }   = await import("@tauri-apps/api/event");
      const { open }   = await import("@tauri-apps/plugin-shell");

      // Start a local HTTP server on a free port — captures the OAuth redirect
      const port = await invoke<number>("plugin:oauth|start", {
        config: {
          response: `<!DOCTYPE html><html><head></head><body style="font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#000;color:#fff"><div style="text-align:center"><div style="font-size:48px;margin-bottom:16px">✓</div><h2 style="color:#0a84ff;margin:0 0 8px">Ares connected to Gmail</h2><p style="color:#888;margin:0">You can close this tab and return to Ares.</p></div></body></html>`,
        },
      });

      // Listen once for the callback URL the plugin receives
      await once<string>("oauth://url", async (event) => {
        try {
          const cbUrl  = event.payload;
          const match  = cbUrl.match(/[?&]code=([^&]+)/);
          if (!match) {
            setGmailError("No code received. Make sure you approved the request.");
            setConnecting(false);
            return;
          }
          const code   = decodeURIComponent(match[1]);
          const tokens = await exchangeCodeForTokens(code, clientId, clientSecret, port);
          setGmailTokens(tokens!.access_token, tokens!.refresh_token);
          setGmailError("");
        } catch (e) {
          const msg = e instanceof Error ? e.message
            : typeof e === "string" ? e
            : JSON.stringify(e);
          setGmailError(msg);
        } finally {
          setConnecting(false);
          // Stop the local server
          invoke("plugin:oauth|cancel", { port }).catch(() => {});
        }
      });

      // Open Google OAuth in the system browser
      const authUrl = buildGmailAuthUrl(clientId, port);
      await open(authUrl);
      setGmailError(`Browser opened — waiting for Google to redirect back (port ${port}). Since your client is Desktop type, no redirect URI setup needed.`);

    } catch (e) {
      setGmailError(e instanceof Error ? e.message : "Failed to start OAuth server.");
      setConnecting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 16px", borderRadius: 10,
    border: "1px solid var(--border)", fontSize: 13,
    color: "var(--text-primary)", background: "var(--bg-elevated)", outline: "none",
    fontFamily: "monospace",
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: "var(--text-secondary)",
    letterSpacing: "0.09em", textTransform: "uppercase" as const, marginBottom: 16,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-surface)" }}>
      <div style={{ padding: "28px 40px 22px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Ares</p>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>Settings</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>Configure your workspace</p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 580 }}>

          {/* Appearance */}
          <section>
            <p style={sectionLabel}>Appearance</p>
            <div style={{ border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>Theme</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Switch between day and night mode</p>
                </div>
                <div style={{ display: "flex", gap: 3, background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 12, padding: 4 }}>
                  {([ ["light", "☀️  Day"], ["dark", "🌙  Night"] ] as const).map(([val, label]) => (
                    <button key={val} onClick={() => setTheme(val)} style={{
                      padding: "8px 20px", borderRadius: 9, fontSize: 13,
                      fontWeight: theme === val ? 600 : 400,
                      cursor: "pointer", border: "none",
                      background: theme === val ? "var(--accent)" : "transparent",
                      color: theme === val ? "#fff" : "var(--text-muted)",
                      boxShadow: theme === val ? "0 0 16px var(--accent-glow)" : "none",
                      transition: "all 0.2s",
                    }}>{label}</button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Groq */}
          <section>
            <p style={sectionLabel}>AI Configuration</p>
            <div style={{ border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>Groq API Key</p>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--easy)", background: "var(--easy-bg)", padding: "2px 8px", borderRadius: 99 }}>FREE</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
                  Powers weekly planner and finance chatbot. Get free key at console.groq.com/keys
                </p>
                <input
                  type="password"
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  placeholder="gsk_••••••••••••••••••••••••••••••"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
                  onBlur={(e)  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
                />
              </div>
              <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", background: "var(--bg-hover)" }}>
                <button onClick={() => { setGroqKey(groqKey); setGroqSaved(true); setTimeout(() => setGroqSaved(false), 2000); }} style={{
                  padding: "9px 22px", borderRadius: 9, border: "none",
                  background: groqSaved ? "var(--easy-bg)" : "var(--accent)",
                  color: groqSaved ? "var(--easy)" : "#fff",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.2s", boxShadow: groqSaved ? "none" : "0 0 16px var(--accent-glow)",
                }}>
                  {groqSaved ? "✓ Saved" : "Save Key"}
                </button>
              </div>
            </div>

            {/* SerpAPI */}
            <div style={{ border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", marginTop: 14 }}>
              <div style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>SerpAPI Key</p>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--accent-text)", background: "var(--accent-glow)", padding: "2px 8px", borderRadius: 99 }}>WEB SEARCH</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
                  Enables the FDE chatbot to search the web. Get a key at serpapi.com (100 free searches/month).
                </p>
                <input
                  type="password"
                  value={serpapiKey}
                  onChange={(e) => setSerpapiKey(e.target.value)}
                  placeholder="••••••••••••••••••••••••••••••"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
                  onBlur={(e)  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
                />
              </div>
              <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", background: "var(--bg-hover)" }}>
                <button onClick={() => { setSerpapiKey(serpapiKey); setSerpapiSaved(true); setTimeout(() => setSerpapiSaved(false), 2000); }} style={{
                  padding: "9px 22px", borderRadius: 9, border: "none",
                  background: serpapiSaved ? "var(--easy-bg)" : "var(--accent)",
                  color: serpapiSaved ? "var(--easy)" : "#fff",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.2s", boxShadow: serpapiSaved ? "none" : "0 0 16px var(--accent-glow)",
                }}>
                  {serpapiSaved ? "✓ Saved" : "Save Key"}
                </button>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section>
            <p style={sectionLabel}>Notifications</p>
            <div style={{ border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: notifEnabled ? "1px solid var(--border)" : "none" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>Desktop Notifications</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Meeting alerts, DSA nudge, and daily brief reminder</p>
                </div>
                <button onClick={() => setNotifEnabled(!notifEnabled)} style={{
                  width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                  background: notifEnabled ? "var(--accent)" : "var(--border)",
                  position: "relative", transition: "background 0.2s", flexShrink: 0,
                }}>
                  <div style={{
                    position: "absolute", top: 3, left: notifEnabled ? 23 : 3, width: 18, height: 18,
                    borderRadius: "50%", background: "#fff", transition: "left 0.2s",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                  }} />
                </button>
              </div>
              {notifEnabled && (
                <>
                  <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)" }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 2 }}>Meeting alerts</p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)" }}>10-minute warning before calendar events</p>
                    </div>
                    <button onClick={() => setNotifMeetingAlert(!notifMeetingAlert)} style={{
                      width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer",
                      background: notifMeetingAlert ? "var(--accent)" : "var(--border)",
                      position: "relative", transition: "background 0.2s", flexShrink: 0,
                    }}>
                      <div style={{
                        position: "absolute", top: 2, left: notifMeetingAlert ? 18 : 2, width: 16, height: 16,
                        borderRadius: "50%", background: "#fff", transition: "left 0.2s",
                      }} />
                    </button>
                  </div>
                  <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)" }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 2 }}>DSA nudge time</p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Remind to solve a question if none done today</p>
                    </div>
                    <input
                      type="time"
                      value={notifDsaNudgeTime}
                      onChange={(e) => setNotifDsaNudgeTime(e.target.value)}
                      style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)", fontSize: 13, outline: "none" }}
                    />
                  </div>
                  <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 2 }}>Daily brief time</p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Morning reminder to open Ares</p>
                    </div>
                    <input
                      type="time"
                      value={notifBriefTime}
                      onChange={(e) => setNotifBriefTime(e.target.value)}
                      style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)", fontSize: 13, outline: "none" }}
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Gmail */}
          <section>
            <p style={sectionLabel}>Gmail Integration</p>
            <div style={{ border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>

              {/* Status bar */}
              <div style={{
                padding: "14px 24px",
                background: gmailToken ? "var(--easy-bg)" : "var(--bg-hover)",
                borderBottom: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: gmailToken ? "var(--easy)" : "var(--text-faint)",
                    boxShadow: gmailToken ? "0 0 6px var(--easy)" : "none",
                  }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: gmailToken ? "var(--easy)" : "var(--text-muted)" }}>
                    {gmailToken ? "Connected" : "Not connected"}
                  </span>
                </div>
                {gmailToken && (
                  <button onClick={clearGmail} style={{
                    padding: "4px 12px", borderRadius: 7, fontSize: 11, fontWeight: 600,
                    cursor: "pointer", border: "1px solid var(--border)",
                    background: "transparent", color: "var(--hard)",
                    transition: "all 0.15s",
                  }}>Disconnect</button>
                )}
              </div>

              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
                  Surfaces meeting invites, Zoom/Meet links, and calendar events from your Gmail. Read-only access.
                </p>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                    Google OAuth Client ID
                  </label>
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="xxxxxxxxxx.apps.googleusercontent.com"
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
                    onBlur={(e)  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                    Google OAuth Client Secret
                  </label>
                  <input
                    type="password"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    placeholder="GOCSPX-••••••••••••••••••••••"
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
                    onBlur={(e)  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
                  />
                </div>

                {gmailError && (
                  <div style={{
                    padding: "10px 14px", borderRadius: 10, fontSize: 12,
                    color: gmailError.includes("Complete") ? "var(--medium)" : "var(--hard)",
                    background: gmailError.includes("Complete") ? "var(--medium-bg)" : "var(--hard-bg)",
                    border: `1px solid ${gmailError.includes("Complete") ? "var(--medium)" : "var(--hard)"}30`,
                    lineHeight: 1.5,
                  }}>
                    {gmailError}
                  </div>
                )}
              </div>

              <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", background: "var(--bg-hover)" }}>
                <button
                  onClick={handleConnectGmail}
                  disabled={connecting}
                  style={{
                    padding: "9px 22px", borderRadius: 9, border: gmailToken ? "1px solid var(--border)" : "none",
                    background: gmailToken ? "var(--bg-elevated)" : "var(--accent)",
                    color: gmailToken ? "var(--text-muted)" : "#fff",
                    fontSize: 13, fontWeight: 600, cursor: connecting ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    boxShadow: gmailToken ? "none" : "0 0 16px var(--accent-glow)",
                  }}
                >
                  {connecting ? "Connecting…" : gmailToken ? "Reconnect Gmail" : "Connect Gmail"}
                </button>
              </div>
            </div>

            {!gmailToken && (
              <div style={{ marginTop: 12, padding: "14px 18px", borderRadius: 12, background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Setup Guide
                </p>
                {[
                  "Go to console.cloud.google.com → create project",
                  "Enable Gmail API in APIs & Services",
                  "Create OAuth 2.0 credentials → Desktop App",
                  "Add http://localhost:1420 as redirect URI",
                  "Paste Client ID + Secret above → Connect Gmail",
                ].map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6, alignItems: "flex-start" }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: "var(--accent-text)", background: "var(--accent-glow)",
                      width: 18, height: 18, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginTop: 1,
                    }}>{i + 1}</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{step}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Data Export / Import */}
          <section>
            <p style={sectionLabel}>Backup & Restore</p>
            <div style={{ border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
              {/* Export row */}
              <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, borderBottom: "1px solid var(--border)" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>Export backup</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Download a JSON file with all your notes, tasks, DSA progress, finance, and prompts</p>
                </div>
                <button onClick={() => { void handleExport(); }} disabled={exporting} style={{
                  padding: "9px 22px", borderRadius: 9, border: "none",
                  background: exportDone ? "var(--easy-bg)" : "var(--accent)",
                  color: exportDone ? "var(--easy)" : "#fff",
                  fontSize: 13, fontWeight: 600, cursor: exporting ? "not-allowed" : "pointer",
                  transition: "all 0.2s", boxShadow: exportDone ? "none" : "0 0 16px var(--accent-glow)",
                  whiteSpace: "nowrap", flexShrink: 0,
                }}>
                  {exportDone ? "✓ Exported" : exporting ? "Exporting…" : "Export JSON"}
                </button>
              </div>

              {/* Import row */}
              <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>Restore from backup</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Import a previously exported JSON file — merges into your current data</p>
                  {importResult && (
                    <p style={{ fontSize: 12, color: "var(--easy)", marginTop: 6, fontWeight: 600 }}>
                      ✓ Imported {importResult.count} records
                    </p>
                  )}
                  {importError && (
                    <p style={{ fontSize: 12, color: "var(--hard)", marginTop: 6 }}>{importError}</p>
                  )}
                </div>
                <label style={{ flexShrink: 0 }}>
                  <input
                    type="file"
                    accept=".json"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleImport(file);
                      e.target.value = "";
                    }}
                  />
                  <span style={{
                    display: "inline-block", padding: "9px 22px", borderRadius: 9,
                    border: "1px solid var(--border)",
                    background: importing ? "var(--bg-elevated)" : "var(--bg-surface)",
                    color: importing ? "var(--text-muted)" : "var(--text-primary)",
                    fontSize: 13, fontWeight: 600, cursor: importing ? "not-allowed" : "pointer",
                    transition: "all 0.2s", whiteSpace: "nowrap",
                  }}>
                    {importing ? "Importing…" : "Import JSON"}
                  </span>
                </label>
              </div>
            </div>
          </section>

          {/* Account */}
          <section>
            <p style={sectionLabel}>Account</p>
            <div style={{ border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>Data Storage</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>All data stored locally on this machine only</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--easy)", background: "var(--easy-bg)", padding: "4px 12px", borderRadius: 99 }}>
                  Private
                </span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
