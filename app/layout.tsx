"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/layout/Sidebar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && pathname !== "/auth") {
        router.replace("/auth");
      } else if (isAuthenticated && pathname === "/auth") {
        router.replace("/");
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <html lang="en">
        <body className="flex items-center justify-center h-screen bg-[#0f0c29]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-600 animate-pulse" />
            <p className="text-slate-400 text-sm">Loading DevKit...</p>
          </div>
        </body>
      </html>
    );
  }

  if (!isAuthenticated) {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden bg-[#0f0c29]">
          {children}
        </main>
      </body>
    </html>
  );
}