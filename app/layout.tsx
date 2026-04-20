"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/layout/Sidebar";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && pathname !== "/auth") router.replace("/auth");
      else if (isAuthenticated && pathname === "/auth") router.replace("/");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <html lang="en">
        <body style={{ background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 20, height: 20, borderRadius: 6, background: "#2563eb" }} />
            <span style={{ fontSize: 13, color: "#6b7280" }}>Loading…</span>
          </div>
        </body>
      </html>
    );
  }

  if (!isAuthenticated) {
    return (
      <html lang="en">
        <body style={{ background: "#fff" }}>{children}</body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", background: "#fff" }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: "hidden", background: "#fff", display: "flex", flexDirection: "column" }}>
          {children}
        </main>
      </body>
    </html>
  );
}