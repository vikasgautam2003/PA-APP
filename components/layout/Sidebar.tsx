"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const NAV = [
  { href: "/",         label: "Dashboard"   },
  { href: "/dsa",      label: "DSA Tracker" },
  { href: "/prompts",  label: "Prompt Vault"},
  { href: "/planner",  label: "Planner"     },
  { href: "/finance",  label: "Finance"     },
  { href: "/settings", label: "Settings"    },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside style={{
      width: 220,
      minWidth: 220,
      height: "100vh",
      background: "#ffffff",
      borderRight: "1px solid #e5e5e5",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
    }}>

      {/* Logo */}
      <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "#2563eb",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "#fff",
          }}>D</div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0a0a0a", letterSpacing: "-0.01em" }}>
            DevKit
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 1 }}>
        {NAV.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} style={{
              display: "flex",
              alignItems: "center",
              padding: "7px 10px",
              borderRadius: 7,
              fontSize: 13,
              fontWeight: active ? 500 : 400,
              color: active ? "#0a0a0a" : "#6b7280",
              background: active ? "#f5f5f5" : "transparent",
              textDecoration: "none",
              borderLeft: active ? "2px solid #2563eb" : "2px solid transparent",
              transition: "all 0.1s",
            }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "#fafafa";
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: "10px 8px", borderTop: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 10px" }}>
          <div style={{
            width: 26, height: 26, borderRadius: "50%",
            background: "#2563eb",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "#fff",
            textTransform: "uppercase", flexShrink: 0,
          }}>
            {user?.username?.[0] ?? "?"}
          </div>
          <span style={{ fontSize: 13, color: "#374151", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.username ?? "Guest"}
          </span>
          <button onClick={logout} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 13, color: "#9ca3af", padding: 2,
          }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
            title="Logout"
          >⏻</button>
        </div>
      </div>
    </aside>
  );
}