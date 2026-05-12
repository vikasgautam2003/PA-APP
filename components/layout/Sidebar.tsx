"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const NAV = [
  { href: "/",         label: "Dashboard",    emoji: "⌂" },
  { href: "/dsa",      label: "DSA Tracker",  emoji: "◈" },
  { href: "/notes",    label: "Notes",        emoji: "✎" },
  { href: "/prompts",  label: "Prompt Vault", emoji: "✦" },
  { href: "/planner",  label: "Planner",      emoji: "▦" },
  { href: "/fde",      label: "FDE Prep",     emoji: "◆" },
  { href: "/aws",      label: "AWS SAA-C03",  emoji: "☁" },
  { href: "/git-github", label: "Git & GitHub", emoji: "⑂" },
  { href: "/github-actions", label: "GitHub Actions", emoji: "⚙" },
  { href: "/finance",  label: "Finance",      emoji: "◎" },
  { href: "/learning-log", label: "Learning Log", emoji: "✐" },
  { href: "/settings",    label: "Settings",     emoji: "⚙" },
];

interface Props { open: boolean; onToggle: () => void; }

export default function Sidebar({ open, onToggle }: Props) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside style={{
      width: open ? 220 : 60, minWidth: open ? 220 : 60,
      height: "100vh",
      background: "var(--bg-sidebar)",
      boxShadow: "var(--shadow-sidebar)",
      display: "flex", flexDirection: "column", flexShrink: 0,
      transition: "width 0.2s ease, min-width 0.2s ease",
      overflow: "hidden",
      zIndex: 10,
    }}>

      {/* Logo */}
      <div style={{
        padding: open ? "20px 16px 18px" : "20px 0 18px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center",
        justifyContent: open ? "space-between" : "center",
        gap: 8, flexShrink: 0,
      }}>
        {open ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
            <Image
              src="/ares-logo.svg"
              alt="Ares"
              width={28}
              height={28}
              style={{ borderRadius: 7, objectFit: "cover", flexShrink: 0 }}
            />
            <span style={{
              fontSize: 15, fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em", overflow: "hidden",
            }}>
              Ares
            </span>
          </div>
        ) : (
          <Image
            src="/ares-logo.svg"
            alt="Ares"
            width={28}
            height={28}
            style={{ borderRadius: 7, objectFit: "cover" }}
          />
        )}
        <button
          onClick={onToggle}
          style={{
            flexShrink: 0,
            width: 24, height: 24,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "none", border: "none",
            borderRadius: 6, cursor: "pointer",
            color: "var(--text-muted)", fontSize: 12,
            transition: "color 0.15s, background 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)";
            (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "none";
            (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
          }}
        >
          {open ? "‹" : "›"}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 1, overflowY: "auto" }}>
        {NAV.map(({ href, label, emoji }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center",
              gap: 10,
              padding: open ? "9px 10px" : "9px 0",
              justifyContent: open ? "flex-start" : "center",
              borderRadius: 8,
              textDecoration: "none",
              fontSize: 13.5,
              fontWeight: active ? 600 : 400,
              color: active ? (document?.documentElement?.getAttribute("data-theme") === "dark" ? "#fff" : "var(--accent)") : "var(--text-secondary)",
              background: active ? "var(--accent-glow)" : "transparent",
              transition: "all 0.12s ease",
              whiteSpace: "nowrap", overflow: "hidden",
            }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                }
              }}
            >
              <span style={{
                fontSize: 14, flexShrink: 0,
                color: active ? "var(--accent)" : "var(--text-muted)",
                transition: "color 0.12s",
              }}>{emoji}</span>
              {open && <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      {open ? (
        <div style={{
          padding: "10px 8px 12px",
          borderTop: "1px solid var(--border)",
          flexShrink: 0,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 10px", borderRadius: 8,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%",
              background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#fff",
              textTransform: "uppercase", flexShrink: 0,
            }}>
              {user?.username?.[0] ?? "?"}
            </div>
            <span style={{
              fontSize: 13, fontWeight: 500,
              color: "var(--text-secondary)",
              flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {user?.username ?? "Guest"}
            </span>
            <button
              onClick={logout}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 14, color: "var(--text-muted)", flexShrink: 0,
                padding: "2px", borderRadius: 4,
                lineHeight: 1, transition: "color 0.15s",
              }}
              title="Sign out"
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--hard)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
            >
              ⏻
            </button>
          </div>
        </div>
      ) : (
        <div style={{ padding: "10px 0 12px", display: "flex", justifyContent: "center", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
          <div style={{
            width: 26, height: 26, borderRadius: "50%",
            background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "#fff",
            textTransform: "uppercase",
          }}>
            {user?.username?.[0] ?? "?"}
          </div>
        </div>
      )}
    </aside>
  );
}
