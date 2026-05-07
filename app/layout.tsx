"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { initTheme, loadPersistedSettings } from "@/store/settingsStore";
import { loadGmailCache } from "@/store/gmailCacheStore";
import { loadCalendarCache } from "@/store/calendarCacheStore";
import Sidebar from "@/components/layout/Sidebar";
import QuickCapture from "@/components/QuickCapture";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => {
    initTheme();
    loadPersistedSettings();
    loadGmailCache();
    loadCalendarCache();
    document.title = "Ares";
  }, []);

  useEffect(() => {
    const shortcut = "CommandOrControl+Shift+A";
    import("@tauri-apps/plugin-global-shortcut").then(({ register, unregister }) => {
      register(shortcut, () => setQuickCaptureOpen((p) => !p)).catch(() => {});
      return () => { unregister(shortcut).catch(() => {}); };
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && pathname !== "/auth") router.replace("/auth");
      else if (isAuthenticated && pathname === "/auth") router.replace("/");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <html lang="en"><body style={{
        background: "var(--bg-base)", display: "flex", alignItems: "center",
        justifyContent: "center", height: "100vh", gap: 12,
      }}>
        <div style={{ width: 24, height: 24, borderRadius: 7, background: "#2563eb", animation: "pulse 1.5s infinite" }} />
        <span style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading Ares…</span>
      </body></html>
    );
  }

  if (!isAuthenticated) {
    return <html lang="en"><body style={{ background: "var(--bg-base)" }}>{children}</body></html>;
  }

  return (
    <html lang="en">
      <body style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", background: "var(--bg-base)" }}>
        <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((p) => !p)} />
        <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", background: "var(--bg-surface)" }}>
          {children}
        </main>
        <QuickCapture open={quickCaptureOpen} onClose={() => setQuickCaptureOpen(false)} />
      </body>
    </html>
  );
}