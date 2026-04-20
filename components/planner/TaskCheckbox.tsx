"use client";

import { useState } from "react";

interface Props {
  done: boolean;
  onCheck: () => Promise<boolean>;
}

export default function TaskCheckbox({ done, onCheck }: Props) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; angle: number }[]>([]);
  const [checking, setChecking] = useState(false);

  const COLORS = ["#2563eb","#7c3aed","#16a34a","#d97706","#f472b6","#60a5fa"];

  async function handleClick() {
    if (done || checking) return;
    setChecking(true);

    // Spawn particles
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: 10, y: 10,
      color: COLORS[i % COLORS.length],
      angle: (i / 8) * 360,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 700);

    await onCheck();
    setChecking(false);
  }

  return (
    <div style={{ position: "relative", width: 22, height: 22, flexShrink: 0 }}>
      <button
        onClick={handleClick}
        disabled={done}
        style={{
          width: 22, height: 22, borderRadius: 7,
          border: `2px solid ${done ? "var(--easy)" : "var(--border-subtle)"}`,
          background: done ? "var(--easy)" : "transparent",
          cursor: done ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
          transform: checking ? "scale(1.3)" : "scale(1)",
        }}
      >
        {done && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none" style={{ animation: "checkPop 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>
            <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Particle burst */}
      {particles.map((p) => (
        <div key={p.id} style={{
          position: "absolute",
          top: p.y, left: p.x,
          width: 6, height: 6,
          borderRadius: "50%",
          background: p.color,
          pointerEvents: "none",
          animation: `particle-${p.angle} 0.7s ease-out forwards`,
        }} />
      ))}

      <style>{`
        @keyframes checkPop {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }
        ${particles.map((p) => `
          @keyframes particle-${p.angle} {
            0% { transform: translate(0,0) scale(1); opacity: 1; }
            100% {
              transform: translate(
                ${Math.cos((p.angle * Math.PI) / 180) * 24}px,
                ${Math.sin((p.angle * Math.PI) / 180) * 24}px
              ) scale(0);
              opacity: 0;
            }
          }
        `).join("")}
      `}</style>
    </div>
  );
}
