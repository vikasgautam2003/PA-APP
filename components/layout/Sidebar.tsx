"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const NAV = [
  { href: "/",         label: "Dashboard",    icon: "▣" },
  { href: "/dsa",      label: "DSA Tracker",  icon: "◈" },
  { href: "/prompts",  label: "Prompt Vault", icon: "◎" },
  { href: "/planner",  label: "Planner",      icon: "▦" },
  { href: "/finance",  label: "Finance",      icon: "◉" },
  { href: "/settings", label: "Settings",     icon: "⊙" },
];

interface Props { open: boolean; onToggle: () => void; }

export default function Sidebar({ open, onToggle }: Props) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside style={{
      width: open ? 220 : 64, minWidth: open ? 220 : 64,
      height: "100vh",
      background: "var(--bg-base)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", flexShrink: 0,
      transition: "width 0.25s cubic-bezier(0.4,0,0.2,1), min-width 0.25s cubic-bezier(0.4,0,0.2,1)",
      overflow: "hidden",
    }}>

      {/* Logo + toggle */}
      <div style={{
        padding: "20px 14px 16px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center",
        justifyContent: open ? "space-between" : "center", gap: 8,
      }}>
        {open && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Image
              src="/icon.png"
              alt="Ares"
              width={30}
              height={30}
              style={{ borderRadius: 9, objectFit: "cover" }}
            />
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Ares
            </span>
          </div>
        )}
        {!open && (
          <Image
            src="/icon.png"
            alt="Ares"
            width={30}
            height={30}
            style={{ borderRadius: 9, objectFit: "cover" }}
          />
        )}
        <button onClick={onToggle} style={{
          background: "none", border: "1px solid var(--border-subtle)",
          borderRadius: 7, color: "var(--text-muted)", cursor: "pointer",
          width: 26, height: 26, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 11, flexShrink: 0,
        }}>
          {open ? "←" : "→"}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: open ? "9px 12px" : "9px 0",
              justifyContent: open ? "flex-start" : "center",
              borderRadius: 9, textDecoration: "none",
              fontSize: 13, fontWeight: active ? 600 : 400,
              color: active ? "var(--text-primary)" : "var(--text-muted)",
              background: active ? "var(--bg-elevated)" : "transparent",
              borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
              whiteSpace: "nowrap", overflow: "hidden",
            }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                }
              }}
            >
              <span style={{ fontSize: 15, flexShrink: 0, opacity: active ? 1 : 0.5 }}>{icon}</span>
              {open && <span>{label}</span>}
              {active && open && (
                <div style={{
                  marginLeft: "auto", width: 6, height: 6, borderRadius: "50%",
                  background: "var(--accent)", boxShadow: "0 0 8px var(--accent-glow)",
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: 10, borderTop: "1px solid var(--border)" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "8px 10px", borderRadius: 9,
          background: "var(--bg-elevated)",
          justifyContent: open ? "flex-start" : "center",
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent), #7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 800, color: "#fff",
            textTransform: "uppercase", flexShrink: 0,
          }}>
            {user?.username?.[0] ?? "?"}
          </div>
          {open && (
            <>
              <span style={{ fontSize: 12, color: "var(--text-muted)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.username ?? "Guest"}
              </span>
              <button onClick={logout} style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 13, color: "var(--text-muted)", flexShrink: 0,
              }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ef4444")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
              >⏻</button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}