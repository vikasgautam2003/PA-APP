"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { initTheme } from "@/store/settingsStore";
import Sidebar from "@/components/layout/Sidebar";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => { initTheme(); }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && pathname !== "/auth") router.replace("/auth");
      else if (isAuthenticated && pathname === "/auth") router.replace("/");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <html lang="en"><body style={{
        background: "#060608", display: "flex", alignItems: "center",
        justifyContent: "center", height: "100vh", gap: 12,
      }}>
        <div style={{ width: 24, height: 24, borderRadius: 7, background: "#2563eb", animation: "pulse 1.5s infinite" }} />
        <span style={{ color: "#4b5563", fontSize: 14 }}>Loading DevKit…</span>
      </body></html>
    );
  }

  if (!isAuthenticated) {
    return <html lang="en"><body style={{ background: "#060608" }}>{children}</body></html>;
  }

  return (
    <html lang="en">
      <body style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", background: "#060608" }}>
        <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((p) => !p)} />
        <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", background: "#0c0c10", borderRadius: sidebarOpen ? "16px 0 0 16px" : 0, transition: "border-radius 0.3s ease" }}>
          {children}
        </main>
      </body>
    </html>
  );
}