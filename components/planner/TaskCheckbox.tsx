"use client";

import { useState, useCallback } from "react";

interface Props {
  done: boolean;
  onCheck: () => Promise<void>;
}

export default function TaskCheckbox({ done, onCheck }: Props) {
  const [animating, setAnimating] = useState(false);
  const [showBurst, setShowBurst] = useState(false);

  const handleClick = useCallback(async () => {
    if (animating) return;
    setAnimating(true);
    if (!done) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 700);
    }
    try {
      await onCheck();
    } finally {
      setAnimating(false);
    }
  }, [done, animating, onCheck]);

  const BURST_COLORS = ["#2563eb","#7c3aed","#16a34a","#d97706","#f472b6","#60a5fa","#4ade80","#fbbf24"];

  const burstAngles = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <div style={{ position: "relative", width: 22, height: 22, flexShrink: 0, cursor: done ? "default" : "pointer" }} onClick={handleClick}>
      {/* Checkbox */}
      <div style={{
        width: 22, height: 22, borderRadius: 7,
        border: `2px solid ${done ? "#16a34a" : animating ? "#2563eb" : "#d1d5db"}`,
        background: done ? "#16a34a" : animating ? "#eff6ff" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
        transform: animating ? "scale(1.15)" : "scale(1)",
        boxShadow: done ? "0 0 8px #16a34a60" : "none",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        if (done) {
          (e.currentTarget as HTMLElement).style.background = "#dc2626";
          (e.currentTarget as HTMLElement).style.borderColor = "#dc2626";
        }
      }}
      onMouseLeave={(e) => {
        if (done) {
          (e.currentTarget as HTMLElement).style.background = "#16a34a";
          (e.currentTarget as HTMLElement).style.borderColor = "#16a34a";
        }
      }}>
        {done && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none"
            style={{ animation: "checkPop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>
            <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>

      {/* Particle burst */}
      {showBurst && burstAngles.map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const tx  = Math.cos(rad) * 28;
        const ty  = Math.sin(rad) * 28;
        return (
          <div key={`${angle}-${i}`} style={{
            position: "absolute",
            top: "50%", left: "50%",
            width: i % 2 === 0 ? 7 : 5,
            height: i % 2 === 0 ? 7 : 5,
            marginTop: i % 2 === 0 ? -3.5 : -2.5,
            marginLeft: i % 2 === 0 ? -3.5 : -2.5,
            borderRadius: "50%",
            background: BURST_COLORS[i % BURST_COLORS.length],
            pointerEvents: "none",
            animation: `burst 0.65s ease-out forwards`,
            // Use CSS custom properties to pass translation values
            // since we can't use inline keyframes per element easily
            transform: "translate(0, 0) scale(1)",
            opacity: 1,
          }}>
            <style>{`
              @keyframes burst {
                0%   { transform: translate(0,0) scale(1); opacity: 1; }
                100% { transform: translate(${tx}px, ${ty}px) scale(0); opacity: 0; }
              }
            `}</style>
          </div>
        );
      })}

      <style>{`
        @keyframes checkPop {
          0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
          60%  { transform: scale(1.2) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
