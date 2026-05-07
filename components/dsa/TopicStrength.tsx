"use client";

import { useState } from "react";
import type { DSAQuestionWithProgress } from "@/types";

interface Props { questions: DSAQuestionWithProgress[]; }

const COLORS = {
  strong:  { stroke: "#16a34a", fill: "#16a34a18", text: "#16a34a", track: "#16a34a25" },
  average: { stroke: "#d97706", fill: "#d9770618", text: "#d97706", track: "#d9770625" },
  weak:    { stroke: "#dc2626", fill: "#dc262618", text: "#dc2626", track: "#dc262625" },
  untried: { stroke: "#4b5563", fill: "#4b556318", text: "#6b7280", track: "#4b556330" },
};
type Level = keyof typeof COLORS;

function bubbleSize(total: number): number {
  if (total >= 60) return 148;
  if (total >= 40) return 128;
  if (total >= 20) return 110;
  if (total >= 10) return 92;
  return 76;
}

interface BubbleProps {
  topic: string;
  done: number;
  total: number;
  weakDone: number; // hard + medium done
}

function Bubble({ topic, done, total, weakDone }: BubbleProps) {
  const [hovered, setHovered] = useState(false);
  const pct      = total > 0 ? done / total : 0;
  const level: Level = pct === 0 ? "untried" : pct >= 0.65 ? "strong" : pct >= 0.3 ? "average" : "weak";
  const c        = COLORS[level];
  const sz       = bubbleSize(total);
  const cx       = sz / 2;
  const cy       = sz / 2;
  const r        = sz / 2 - 5;
  const circ     = 2 * Math.PI * r;
  const arcLen   = pct * circ;
  const sw       = sz >= 110 ? 5 : sz >= 92 ? 4 : 3;
  const words    = topic.split(" ");
  const maxChars = words.reduce((m, w) => Math.max(m, w.length), 0);
  const fs       = Math.min(sz / (maxChars > 7 ? 8 : 7), sz / (words.length > 2 ? 6 : 5));
  const lineH    = fs + 2;
  const textY    = words.length === 1
    ? cy + 2
    : cy - ((words.length - 1) * lineH) / 2;

  return (
    <div
      style={{ cursor: "default", flexShrink: 0, position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <svg width={sz} height={sz} style={{ overflow: "visible", transition: "filter 0.2s", filter: hovered ? `drop-shadow(0 0 8px ${c.stroke}70)` : "none" }}>
        {/* Background fill */}
        <circle cx={cx} cy={cy} r={r} fill={c.fill} />
        {/* Track ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={c.track} strokeWidth={sw} />
        {/* Progress arc */}
        {pct > 0 && (
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={c.stroke}
            strokeWidth={sw}
            strokeDasharray={`${arcLen} ${circ}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        )}
        {/* Topic words */}
        {words.map((word, i) => (
          <text
            key={i}
            x={cx}
            y={textY + i * lineH}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={c.text}
            fontSize={fs}
            fontWeight="700"
            fontFamily="inherit"
          >
            {word}
          </text>
        ))}
        {/* done/total */}
        <text
          x={cx}
          y={cy + r - sw - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={`${c.stroke}99`}
          fontSize={Math.max(8, sz / 13)}
          fontFamily="inherit"
        >
          {done}/{total}
        </text>
      </svg>

      {/* Hover tooltip */}
      {hovered && (
        <div style={{
          position: "absolute", bottom: sz + 6, left: "50%", transform: "translateX(-50%)",
          background: "var(--bg-elevated)", border: `1px solid ${c.stroke}50`,
          borderRadius: 10, padding: "8px 12px", zIndex: 20, whiteSpace: "nowrap",
          boxShadow: `0 4px 20px rgba(0,0,0,0.4)`,
          pointerEvents: "none",
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>{topic}</p>
          <p style={{ fontSize: 11, color: c.text, fontWeight: 600 }}>
            {Math.round(pct * 100)}% complete · {done}/{total}
          </p>
          {weakDone > 0 && <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{weakDone} med/hard solved</p>}
        </div>
      )}
    </div>
  );
}

export default function TopicStrength({ questions }: Props) {
  const topicMap = new Map<string, { done: number; total: number; weakDone: number }>();

  for (const q of questions) {
    if (!topicMap.has(q.topic)) topicMap.set(q.topic, { done: 0, total: 0, weakDone: 0 });
    const t = topicMap.get(q.topic)!;
    t.total++;
    if (q.status === "done") {
      t.done++;
      if (q.difficulty === "Medium" || q.difficulty === "Hard") t.weakDone++;
    }
  }

  const bubbles = [...topicMap.entries()]
    .map(([topic, { done, total, weakDone }]) => ({ topic, done, total, weakDone }))
    .sort((a, b) => b.total - a.total);

  const totalDone  = bubbles.reduce((s, b) => s + b.done,  0);
  const totalAll   = bubbles.reduce((s, b) => s + b.total, 0);
  const strongCount  = bubbles.filter(b => b.total > 0 && b.done / b.total >= 0.65).length;
  const weakCount    = bubbles.filter(b => b.total > 0 && b.done / b.total > 0    && b.done / b.total < 0.3).length;
  const untriedCount = bubbles.filter(b => b.done === 0).length;

  return (
    <div>
      {/* Summary bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Total solved",  value: `${totalDone}/${totalAll}`, color: "var(--accent-text)" },
          { label: "Strong topics", value: strongCount,  color: COLORS.strong.text },
          { label: "Weak topics",   value: weakCount,    color: COLORS.weak.text   },
          { label: "Not started",   value: untriedCount, color: COLORS.untried.text },
        ].map(s => (
          <div key={s.label} style={{
            padding: "8px 16px", borderRadius: 10, background: "var(--bg-elevated)",
            border: "1px solid var(--border)", display: "flex", alignItems: "baseline", gap: 8,
          }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.label}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto", flexWrap: "wrap" }}>
          {(["strong", "average", "weak", "untried"] as Level[]).map(lv => (
            <div key={lv} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS[lv].stroke, opacity: 0.9 }} />
              <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "capitalize" }}>
                {lv === "strong" ? "≥65%" : lv === "average" ? "30–65%" : lv === "weak" ? "<30%" : "0%"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bubble map */}
      <div style={{
        background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 16,
        padding: "28px 20px", boxShadow: "var(--shadow-card)",
        display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", justifyContent: "center",
        minHeight: 320,
      }}>
        {bubbles.map(b => (
          <Bubble key={b.topic} topic={b.topic} done={b.done} total={b.total} weakDone={b.weakDone} />
        ))}
      </div>
    </div>
  );
}
