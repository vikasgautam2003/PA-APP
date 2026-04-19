"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/",         label: "Dashboard",  icon: "⬡" },
  { href: "/dsa",      label: "DSA Tracker", icon: "◈" },
  { href: "/prompts",  label: "Prompt Vault", icon: "◎" },
  { href: "/planner",  label: "Planner",     icon: "◷" },
  { href: "/finance",  label: "Finance",     icon: "◉" },
  { href: "/settings", label: "Settings",    icon: "◌" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside
      style={{ width: "var(--sidebar-width)" }}
      className="h-screen flex flex-col bg-[#0a0820] border-r border-[#1e1b4b] shrink-0"
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[#1e1b4b]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-xs font-bold">
            D
          </div>
          <span className="font-bold text-sm tracking-wide text-white">
            DevKit
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                active
                  ? "bg-violet-600/20 text-violet-300 font-medium"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-[#1e1b4b]">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-violet-700 flex items-center justify-center text-xs font-bold uppercase">
            {user?.username?.[0] ?? "?"}
          </div>
          <span className="text-sm text-slate-300 flex-1 truncate">
            {user?.username ?? "Guest"}
          </span>
          <button
            onClick={logout}
            className="text-slate-500 hover:text-red-400 text-xs transition-colors"
            title="Logout"
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  );
}