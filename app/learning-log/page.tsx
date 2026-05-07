"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import { getDb } from "@/lib/db";

/* ─── Logo SVG Components ─────────────────────────────────────────────────── */

function LogoAWS() {
  return (
    <svg width="52" height="28" viewBox="0 0 80 44" fill="none">
      <text x="0" y="32" fontSize="32" fontWeight="900" fill="#FF9900" fontFamily="Arial, sans-serif">AWS</text>
      <path d="M6 40 Q40 50 74 40" stroke="#FF9900" strokeWidth="3" strokeLinecap="round"/>
      <path d="M68 36 L76 40 L68 44" fill="#FF9900"/>
    </svg>
  );
}

function LogoJS() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="5" fill="#F7DF1E"/>
      <text x="4" y="31" fontSize="22" fontWeight="800" fill="#111" fontFamily="monospace">JS</text>
    </svg>
  );
}

function LogoTS() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="5" fill="#3178C6"/>
      <text x="4" y="31" fontSize="22" fontWeight="800" fill="white" fontFamily="monospace">TS</text>
    </svg>
  );
}

function LogoPython() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="19" fill="#3776AB"/>
      <text x="7" y="28" fontSize="18" fontWeight="900" fill="#FFD845" fontFamily="monospace">Py</text>
    </svg>
  );
}

function LogoReact() {
  return (
    <svg width="44" height="40" viewBox="0 0 88 80" fill="none">
      <ellipse cx="44" cy="40" rx="40" ry="15" stroke="#61DAFB" strokeWidth="4.5"/>
      <ellipse cx="44" cy="40" rx="40" ry="15" stroke="#61DAFB" strokeWidth="4.5" transform="rotate(60 44 40)"/>
      <ellipse cx="44" cy="40" rx="40" ry="15" stroke="#61DAFB" strokeWidth="4.5" transform="rotate(-60 44 40)"/>
      <circle cx="44" cy="40" r="7" fill="#61DAFB"/>
    </svg>
  );
}

function LogoNode() {
  return (
    <svg width="36" height="42" viewBox="0 0 60 70" fill="none">
      <polygon points="30,2 56,17 56,53 30,68 4,53 4,17" fill="#339933"/>
      <text x="12" y="46" fontSize="30" fontWeight="900" fill="white" fontFamily="monospace">N</text>
    </svg>
  );
}

function LogoGo() {
  return (
    <svg width="52" height="22" viewBox="0 0 84 36" fill="none">
      <text x="0" y="28" fontSize="30" fontWeight="700" fill="#00ADD8" fontFamily="Arial, sans-serif">Go</text>
    </svg>
  );
}

function LogoRust() {
  return (
    <svg width="40" height="40" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="30" stroke="#CE422B" strokeWidth="7"/>
      <circle cx="40" cy="40" r="10" fill="#CE422B"/>
      {[0,45,90,135,180,225,270,315].map((a, i) => {
        const rad = (a * Math.PI) / 180;
        return (
          <line key={i}
            x1={40 + 10 * Math.cos(rad)} y1={40 + 10 * Math.sin(rad)}
            x2={40 + 27 * Math.cos(rad)} y2={40 + 27 * Math.sin(rad)}
            stroke="#CE422B" strokeWidth="7" strokeLinecap="round"/>
        );
      })}
    </svg>
  );
}

function LogoDocker() {
  return (
    <svg width="46" height="36" viewBox="0 0 90 72" fill="none">
      {([[2,30],[16,30],[30,30],[44,30],[2,17],[16,17],[30,17],[16,4]] as [number,number][]).map(([x,y],i) => (
        <rect key={i} x={x} y={y} width="12" height="11" rx="2" fill="#2496ED"/>
      ))}
      <path d="M4 48 Q18 62 38 57 Q52 63 64 57 Q74 50 73 42" stroke="#2496ED" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <circle cx="74" cy="40" r="4" fill="#2496ED"/>
      <path d="M74 36 Q80 26 84 18" stroke="#2496ED" strokeWidth="3" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function LogoK8s() {
  return (
    <svg width="40" height="40" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="34" stroke="#326CE5" strokeWidth="6"/>
      <circle cx="40" cy="40" r="9" fill="#326CE5"/>
      {[0,51.4,102.8,154.2,205.7,257.1,308.5].map((a, i) => {
        const rad = (a * Math.PI) / 180;
        return (
          <line key={i}
            x1={40 + 9 * Math.cos(rad)} y1={40 + 9 * Math.sin(rad)}
            x2={40 + 31 * Math.cos(rad)} y2={40 + 31 * Math.sin(rad)}
            stroke="#326CE5" strokeWidth="5"/>
        );
      })}
    </svg>
  );
}

function LogoAIML() {
  return (
    <svg width="40" height="40" viewBox="0 0 80 80" fill="none">
      {([[15,40],[40,15],[65,40],[40,65]] as [number,number][]).map(([cx,cy],i) => (
        <line key={i} x1="40" y1="40" x2={cx} y2={cy} stroke="#8B5CF6" strokeWidth="2.5" strokeOpacity="0.5"/>
      ))}
      {([[15,40],[40,15],[65,40],[40,65]] as [number,number][]).map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="8" fill="#8B5CF6"/>
      ))}
      <circle cx="40" cy="40" r="10" fill="#8B5CF6"/>
      <circle cx="40" cy="5" r="4" fill="#C4B5FD" opacity="0.8"/>
      <circle cx="75" cy="40" r="4" fill="#C4B5FD" opacity="0.8"/>
    </svg>
  );
}

function LogoCloud() {
  return (
    <svg width="50" height="34" viewBox="0 0 90 60" fill="none">
      <path d="M70 50 Q84 50 84 38 Q84 28 74 26 Q76 12 62 10 Q52 10 48 18 Q42 12 34 14 Q22 14 22 26 Q14 26 14 36 Q14 50 28 50 Z" fill="#4285F4"/>
    </svg>
  );
}

function LogoLinux() {
  return (
    <svg width="36" height="44" viewBox="0 0 64 80" fill="none">
      <ellipse cx="32" cy="26" rx="18" ry="22" fill="#1a1a1a"/>
      <circle cx="24" cy="20" r="5" fill="white"/>
      <circle cx="40" cy="20" r="5" fill="white"/>
      <circle cx="25" cy="21" r="2.5" fill="#1a1a1a"/>
      <circle cx="41" cy="21" r="2.5" fill="#1a1a1a"/>
      <ellipse cx="32" cy="32" rx="5" ry="3.5" fill="#FF9900"/>
      <ellipse cx="32" cy="58" rx="22" ry="18" fill="#FFD700"/>
      <ellipse cx="32" cy="60" rx="13" ry="12" fill="white"/>
    </svg>
  );
}

function LogoDB() {
  return (
    <svg width="34" height="44" viewBox="0 0 64 84" fill="none">
      <ellipse cx="32" cy="14" rx="28" ry="12" fill="#00A1C2"/>
      <rect x="4" y="14" width="56" height="22" fill="#00758F"/>
      <ellipse cx="32" cy="36" rx="28" ry="12" fill="#00A1C2"/>
      <rect x="4" y="36" width="56" height="22" fill="#00758F"/>
      <ellipse cx="32" cy="58" rx="28" ry="12" fill="#00B8D9"/>
      <ellipse cx="32" cy="14" rx="28" ry="12" fill="#00C9E8" opacity="0.7"/>
    </svg>
  );
}

function LogoGit() {
  return (
    <svg width="40" height="40" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="36" fill="#F05032"/>
      <circle cx="24" cy="30" r="6" fill="white"/>
      <circle cx="24" cy="56" r="6" fill="white"/>
      <circle cx="56" cy="30" r="6" fill="white"/>
      <line x1="24" y1="36" x2="24" y2="50" stroke="white" strokeWidth="5"/>
      <path d="M24 30 Q24 14 56 30" fill="none" stroke="white" strokeWidth="5"/>
    </svg>
  );
}

function LogoSystemDesign() {
  return (
    <svg width="46" height="38" viewBox="0 0 86 72" fill="none">
      <rect x="2" y="4" width="24" height="17" rx="4" fill="#7C3AED"/>
      <rect x="62" y="4" width="24" height="17" rx="4" fill="#7C3AED"/>
      <rect x="32" y="4" width="24" height="17" rx="4" fill="#6D28D9"/>
      <rect x="2" y="51" width="24" height="17" rx="4" fill="#7C3AED"/>
      <rect x="62" y="51" width="24" height="17" rx="4" fill="#7C3AED"/>
      <line x1="26" y1="12" x2="32" y2="12" stroke="#A78BFA" strokeWidth="3"/>
      <polygon points="32,9 38,12 32,15" fill="#A78BFA"/>
      <line x1="56" y1="12" x2="62" y2="12" stroke="#A78BFA" strokeWidth="3"/>
      <polygon points="62,9 68,12 62,15" fill="#A78BFA"/>
      <line x1="14" y1="21" x2="14" y2="51" stroke="#A78BFA" strokeWidth="2.5" strokeDasharray="4,3"/>
      <line x1="74" y1="21" x2="74" y2="51" stroke="#A78BFA" strokeWidth="2.5" strokeDasharray="4,3"/>
    </svg>
  );
}

/* ─── Data ────────────────────────────────────────────────────────────────── */

interface TechTag { id: string; label: string; color: string; Logo: () => React.ReactElement; }

const TECH_TAGS: TechTag[] = [
  { id: "aws",           label: "AWS",           color: "#FF9900", Logo: LogoAWS },
  { id: "javascript",    label: "JavaScript",    color: "#D4AF37", Logo: LogoJS },
  { id: "typescript",    label: "TypeScript",    color: "#3178C6", Logo: LogoTS },
  { id: "python",        label: "Python",        color: "#3776AB", Logo: LogoPython },
  { id: "react",         label: "React",         color: "#06B6D4", Logo: LogoReact },
  { id: "nodejs",        label: "Node.js",       color: "#339933", Logo: LogoNode },
  { id: "go",            label: "Go",            color: "#00ADD8", Logo: LogoGo },
  { id: "rust",          label: "Rust",          color: "#CE422B", Logo: LogoRust },
  { id: "docker",        label: "Docker",        color: "#2496ED", Logo: LogoDocker },
  { id: "kubernetes",    label: "Kubernetes",    color: "#326CE5", Logo: LogoK8s },
  { id: "ai-ml",         label: "AI / ML",       color: "#8B5CF6", Logo: LogoAIML },
  { id: "cloud",         label: "Cloud",         color: "#4285F4", Logo: LogoCloud },
  { id: "linux",         label: "Linux",         color: "#C8A000", Logo: LogoLinux },
  { id: "database",      label: "Database",      color: "#00758F", Logo: LogoDB },
  { id: "git",           label: "Git",           color: "#F05032", Logo: LogoGit },
  { id: "system-design", label: "System Design", color: "#7C3AED", Logo: LogoSystemDesign },
];

const PROMPTS = [
  { id: "concept",   emoji: "💡", text: "Concept learned",     hint: "Explain a new concept you understood today…" },
  { id: "bugfix",    emoji: "🐛", text: "Bug I crushed",       hint: "Describe the bug and how you hunted it down…" },
  { id: "shipped",   emoji: "🚀", text: "Shipped something",   hint: "What did you build, deploy, or merge today?" },
  { id: "aha",       emoji: "🤯", text: "AHA moment",          hint: "That thing that finally clicked — what was it?" },
  { id: "resource",  emoji: "📖", text: "Great resource",      hint: "What did you read/watch and why is it useful?" },
  { id: "tool",      emoji: "🔧", text: "Tool discovered",     hint: "What tool, lib, or shortcut changed your workflow?" },
  { id: "solved",    emoji: "🧩", text: "Problem solved",      hint: "What was the problem? How did you crack it?" },
  { id: "explained", emoji: "🗣", text: "Explained to someone", hint: "Teaching is learning — what did you explain?" },
];

function streakMessage(n: number): string | null {
  if (n === 1)   return "Day 1 — every expert started here 🌱";
  if (n === 3)   return "3 days in. You're building something real 💪";
  if (n === 7)   return "One full week. Consistency is your superpower 🔥";
  if (n === 14)  return "Two weeks straight! The compound effect is real ⚡";
  if (n === 21)  return "21 days — this is officially a habit 🎯";
  if (n === 30)  return "30 days. Top 1% of learners 🏆";
  if (n === 100) return "100 DAYS!! You are an absolute machine 🚀🎉";
  if (n > 100)   return `${n} days. Simply unstoppable 🔥🔥🔥`;
  return null;
}

/* ─── Types + helpers ─────────────────────────────────────────────────────── */

interface LogEntry { id: number; content: string; tags: string; date: string; created_at: string; }

function localDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function computeStreak(entries: LogEntry[]): number {
  if (!entries.length) return 0;
  const dates = new Set(entries.map(e => e.date));
  const today = localDateStr(new Date());
  const d = new Date();
  if (!dates.has(today)) d.setDate(d.getDate() - 1);
  let s = 0;
  while (dates.has(localDateStr(d))) { s++; d.setDate(d.getDate() - 1); }
  return s;
}

function tagColor(id: string) { return TECH_TAGS.find(t => t.id === id)?.color ?? "var(--text-muted)"; }
function tagLabel(id: string) { return TECH_TAGS.find(t => t.id === id)?.label ?? id; }

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function LearningLogPage() {
  const { user } = useAuthStore();
  const [entries, setEntries]           = useState<LogEntry[]>([]);
  const [text, setText]                 = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [saving, setSaving]             = useState(false);
  const [saved, setSaved]               = useState(false);
  const [celebKey, setCelebKey]         = useState(0);
  const [search, setSearch]             = useState("");

  const today    = localDateStr(new Date());
  const streak   = useMemo(() => computeStreak(entries), [entries]);
  const streakMsg = streakMessage(streak);

  async function initAndLoad() {
    if (!user) return;
    const db = await getDb();
    await db.execute(`CREATE TABLE IF NOT EXISTS learning_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      content TEXT NOT NULL,
      tags TEXT DEFAULT '',
      date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    const rows = await db.select<LogEntry[]>(
      "SELECT * FROM learning_log WHERE user_id = ? ORDER BY date DESC, created_at DESC",
      [user.id]
    );
    setEntries(rows);
  }

  useEffect(() => { void initAndLoad(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    if (!text.trim() || !user || saving) return;
    setSaving(true);
    try {
      const db = await getDb();
      await db.execute(
        "INSERT INTO learning_log (user_id, content, tags, date) VALUES (?, ?, ?, ?)",
        [user.id, text.trim(), selectedTags.join(","), today]
      );
      setText("");
      setSelectedTags([]);
      setSelectedPrompt(null);
      setSaved(true);
      setCelebKey(k => k + 1);
      setTimeout(() => setSaved(false), 2200);
      await initAndLoad();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!user) return;
    const db = await getDb();
    await db.execute("DELETE FROM learning_log WHERE id = ? AND user_id = ?", [id, user.id]);
    await initAndLoad();
  }

  function toggleTag(id: string) {
    setSelectedTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter(e => e.content.toLowerCase().includes(q) || e.tags.toLowerCase().includes(q));
  }, [entries, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, LogEntry[]>();
    for (const e of filtered) {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push(e);
    }
    return [...map.entries()];
  }, [filtered]);

  const activePlaceholder = selectedPrompt
    ? PROMPTS.find(p => p.id === selectedPrompt)?.hint ?? "What did you learn today?"
    : "What did you learn today? Don't filter — just write.";

  function formatDate(dateStr: string) {
    const yesterday = localDateStr(new Date(Date.now() - 86400000));
    if (dateStr === today)     return "Today";
    if (dateStr === yesterday) return "Yesterday";
    return new Date(dateStr + "T12:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  }

  function formatTime(ts: string) {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? "" : d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-surface)", overflow: "hidden" }}>
      <style>{`
        @keyframes ll-pop {
          0%   { transform: scale(1); }
          35%  { transform: scale(1.18) rotate(-1.5deg); }
          65%  { transform: scale(0.93) rotate(0.5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes ll-glow-form {
          0%,100% { box-shadow: var(--shadow-card); }
          40%     { box-shadow: 0 0 0 3px rgba(99,102,241,0.2), 0 0 50px rgba(99,102,241,0.12); }
        }
        .ll-btn-celebrate { animation: ll-pop 0.55s cubic-bezier(0.36,0.07,0.19,0.97) forwards; }
        .ll-form-celebrate { animation: ll-glow-form 1.6s ease; }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{
        padding: "20px 40px 16px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
      }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
            Growth Journal
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", lineHeight: 1 }}>
            Learning Log
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {streak > 0 && (
            <div style={{
              padding: "8px 16px", borderRadius: 12,
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              textAlign: "center",
            }}>
              <p style={{ fontSize: 20, fontWeight: 800, lineHeight: 1, color: "var(--accent-text)" }}>
                🔥 {streak}d
              </p>
              <p style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 2 }}>streak</p>
              {streakMsg && (
                <p style={{ fontSize: 10, color: "var(--accent-text)", marginTop: 4, maxWidth: 170 }}>
                  {streakMsg}
                </p>
              )}
            </div>
          )}
          <div style={{
            padding: "8px 14px", borderRadius: 12,
            background: "var(--bg-elevated)", border: "1px solid var(--border)", textAlign: "center",
          }}>
            <p style={{ fontSize: 20, fontWeight: 800, lineHeight: 1, color: "var(--text-primary)" }}>{entries.length}</p>
            <p style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 2 }}>entries</p>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search entries…"
            style={{
              padding: "8px 14px", borderRadius: 10, border: "1px solid var(--border)",
              background: "var(--bg-elevated)", color: "var(--text-primary)",
              fontSize: 13, outline: "none", width: 200,
            }}
            onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
            onBlur={e  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
          />
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 40px" }}>

        {/* ── Entry form ── */}
        {!search && (
          <div
            key={saved ? "celebrating" : "idle"}
            className={saved ? "ll-form-celebrate" : ""}
            style={{
              border: "1px solid var(--border)", borderRadius: 20,
              background: "var(--bg-elevated)", boxShadow: "var(--shadow-card)",
              padding: "22px 24px", marginBottom: 36,
            }}
          >
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </p>

            {/* Prompt chips */}
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>
              What kind of learning?
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 18 }}>
              {PROMPTS.map(p => {
                const on = selectedPrompt === p.id;
                return (
                  <button key={p.id} onClick={() => setSelectedPrompt(on ? null : p.id)} style={{
                    padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: on ? 700 : 500,
                    cursor: "pointer",
                    border: `1.5px solid ${on ? "var(--accent)" : "var(--border)"}`,
                    background: on ? "var(--accent-glow)" : "transparent",
                    color: on ? "var(--accent-text)" : "var(--text-secondary)",
                    transition: "all 0.12s",
                  }}>
                    {p.emoji} {p.text}
                  </button>
                );
              })}
            </div>

            {/* Textarea */}
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void handleSave(); }}
              placeholder={activePlaceholder}
              rows={4}
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 12,
                border: "1.5px solid var(--border)", fontSize: 14, lineHeight: 1.7,
                color: "var(--text-primary)", background: "var(--bg-surface)",
                outline: "none", resize: "vertical", boxSizing: "border-box",
                fontFamily: "inherit", marginBottom: 20,
              }}
              onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
              onBlur={e  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
            />

            {/* Tech tag tiles */}
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 12 }}>
              Tag a technology
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
              {TECH_TAGS.map(tag => {
                const on = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    style={{
                      width: 84, height: 80, borderRadius: 14, cursor: "pointer",
                      border: `2px solid ${tag.color}${on ? "80" : "28"}`,
                      background: on ? `${tag.color}22` : `${tag.color}0a`,
                      display: "flex", flexDirection: "column", alignItems: "center",
                      justifyContent: "center", gap: 5, padding: "8px 4px",
                      transition: "all 0.14s",
                      transform: on ? "scale(1.07)" : "scale(1)",
                      boxShadow: on ? `0 0 18px ${tag.color}38` : "none",
                    }}
                    onMouseEnter={e => {
                      if (!on) {
                        const el = e.currentTarget as HTMLElement;
                        el.style.background = `${tag.color}18`;
                        el.style.borderColor = `${tag.color}55`;
                        el.style.transform = "scale(1.04)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!on) {
                        const el = e.currentTarget as HTMLElement;
                        el.style.background = `${tag.color}0a`;
                        el.style.borderColor = `${tag.color}28`;
                        el.style.transform = "scale(1)";
                      }
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 44 }}>
                      <tag.Logo />
                    </div>
                    <span style={{
                      fontSize: 9.5, fontWeight: 700,
                      color: on ? tag.color : "var(--text-secondary)",
                      letterSpacing: "0.02em", textAlign: "center", lineHeight: 1.2,
                    }}>
                      {tag.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Save row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontSize: 11, color: "var(--text-faint)" }}>⌘↵ to save quickly</p>
              <button
                key={celebKey}
                onClick={() => { void handleSave(); }}
                disabled={!text.trim() || saving}
                className={saved ? "ll-btn-celebrate" : ""}
                style={{
                  padding: "11px 30px", borderRadius: 12, border: "none",
                  fontSize: 14, fontWeight: 700,
                  cursor: !text.trim() ? "not-allowed" : "pointer",
                  background: saved ? "#16a34a" : !text.trim() ? "var(--border)" : "var(--accent)",
                  color: !text.trim() ? "var(--text-muted)" : "#fff",
                  boxShadow: saved
                    ? "0 0 24px #16a34a60"
                    : !text.trim() ? "none" : "0 0 16px var(--accent-glow)",
                  transition: "background 0.25s, box-shadow 0.25s",
                }}
              >
                {saved ? "🎉 Logged!" : saving ? "Saving…" : "Log it →"}
              </button>
            </div>
          </div>
        )}

        {/* ── Entries ── */}
        {grouped.length === 0 ? (
          <div style={{ textAlign: "center", padding: "70px 0" }}>
            <p style={{ fontSize: 52, marginBottom: 16 }}>🌱</p>
            <p style={{ fontSize: 17, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>
              {search ? "No entries match that search" : "Your growth journal awaits"}
            </p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 340, margin: "0 auto", lineHeight: 1.6 }}>
              {search
                ? "Try a different keyword or technology name."
                : "Every expert was once a beginner. Log your first learning above and start your streak today."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {grouped.map(([date, dayEntries]) => (
              <div key={date}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: date === today ? "var(--accent-text)" : "var(--text-secondary)",
                  }}>
                    {formatDate(date)}
                  </span>
                  <div style={{ flex: 1, height: 1, background: "var(--border)" }}/>
                  <span style={{ fontSize: 10, color: "var(--text-faint)" }}>
                    {dayEntries.length} {dayEntries.length === 1 ? "entry" : "entries"}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {dayEntries.map(entry => {
                    const tags = entry.tags ? entry.tags.split(",").filter(Boolean) : [];
                    const borderCol = tags.length > 0 ? tagColor(tags[0]) : "var(--border)";
                    return (
                      <div
                        key={entry.id}
                        style={{
                          border: "1px solid var(--border)",
                          borderLeft: `4px solid ${borderCol}`,
                          borderRadius: 12, padding: "14px 18px",
                          background: "var(--bg-elevated)",
                          boxShadow: "var(--shadow-card)",
                          position: "relative",
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget.querySelector(".ll-delete") as HTMLElement | null)?.style &&
                            ((e.currentTarget.querySelector(".ll-delete") as HTMLElement).style.opacity = "1");
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget.querySelector(".ll-delete") as HTMLElement | null)?.style &&
                            ((e.currentTarget.querySelector(".ll-delete") as HTMLElement).style.opacity = "0");
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                          <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.65, flex: 1 }}>
                            {entry.content}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                            <span style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 3 }}>
                              {formatTime(entry.created_at)}
                            </span>
                            <button
                              className="ll-delete"
                              onClick={() => void handleDelete(entry.id)}
                              style={{
                                opacity: 0, transition: "opacity 0.15s",
                                background: "none", border: "none", cursor: "pointer",
                                fontSize: 13, color: "var(--text-faint)", padding: "2px 4px", borderRadius: 4,
                              }}
                              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "var(--hard)")}
                              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "var(--text-faint)")}
                              title="Delete entry"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        {tags.length > 0 && (
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                            {tags.map(tid => (
                              <span key={tid} style={{
                                fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                                color: tagColor(tid),
                                background: `${tagColor(tid)}15`,
                                border: `1px solid ${tagColor(tid)}30`,
                              }}>
                                {tagLabel(tid)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
