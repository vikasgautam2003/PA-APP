"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

interface Props {
  onDone: () => void;
}

export default function CelebrationOverlay({ onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: {
      x: number; y: number; vx: number; vy: number;
      color: string; size: number; alpha: number; decay: number;
    }[] = [];

    const colors = ["#2563eb","#7c3aed","#16a34a","#d97706","#db2777","#60a5fa","#4ade80","#fbbf24","#f472b6"];

    for (let burst = 0; burst < 6; burst++) {
      const bx = Math.random() * canvas.width;
      const by = Math.random() * canvas.height * 0.6;
      for (let i = 0; i < 40; i++) {
        const angle = (Math.random() * Math.PI * 2);
        const speed = Math.random() * 8 + 2;
        particles.push({
          x: bx, y: by,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 6 + 2,
          alpha: 1,
          decay: Math.random() * 0.015 + 0.008,
        });
      }
    }

    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 4 + 1,
        alpha: 1,
        decay: 0.005,
      });
    }

    let animId: number;
    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      let alive = false;
      for (const p of particles) {
        if (p.alpha <= 0) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.alpha -= p.decay;
        ctx!.save();
        ctx!.globalAlpha = Math.max(0, p.alpha);
        ctx!.fillStyle = p.color;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }
      if (alive) animId = requestAnimationFrame(animate);
    }
    animate();

    const timer = setTimeout(onDone, 3500);
    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(timer);
    };
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "rgba(6,6,8,0.85)",
      backdropFilter: "blur(4px)",
      animation: "fadeInOut 3.5s ease forwards",
    }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
        animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
      }}>
        <Image
          src="/ares-logo.svg"
          alt="Ares"
          width={80}
          height={80}
          style={{
            borderRadius: 22,
            objectFit: "cover",
            boxShadow: "0 0 60px #2563eb80, 0 0 120px #7c3aed40",
            animation: "pulse 0.8s ease infinite alternate",
          }}
        />

        <div style={{ textAlign: "center" }}>
          <p style={{
            fontSize: 42, fontWeight: 900, color: "#fff",
            letterSpacing: "-0.03em", lineHeight: 1,
            textShadow: "0 0 40px #2563eb, 0 0 80px #7c3aed",
          }}>Day Complete!</p>
          <p style={{ fontSize: 16, color: "#9ca3af", marginTop: 8 }}>You crushed it today 🎯</p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {["🔥","⚡","✨","🚀","💪"].map((e, i) => (
            <span key={i} style={{
              fontSize: 28,
              animation: `bounce 0.6s ${i * 0.1}s ease infinite alternate`,
              display: "inline-block",
            }}>{e}</span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeInOut {0% { opacity: 0; }10% { opacity: 1; }80% { opacity: 1; }100% { opacity: 0; }}
        @keyframes popIn {0% { transform: scale(0.5); opacity: 0; }100% { transform: scale(1); opacity: 1; }}
        @keyframes pulse {from { box-shadow: 0 0 40px #2563eb80; transform: scale(1); }to { box-shadow: 0 0 80px #2563eb, 0 0 120px #7c3aed60; transform: scale(1.05); }}
        @keyframes bounce {from { transform: translateY(0); }to { transform: translateY(-10px); }}
      `}</style>
    </div>
  );
}
