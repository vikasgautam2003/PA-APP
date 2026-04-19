"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { login, signup } from "@/lib/auth";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      const user =
        mode === "login"
          ? await login(username, password)
          : await signup(username, password);

      setUser(user, {
        user_id: user.id,
        username: user.username,
        token: crypto.randomUUID(),
      });
    } catch (e) {
      setError(typeof e === "string" ? e : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0c29] flex items-center justify-center p-4">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center font-bold text-lg">
            D
          </div>
          <div>
            <div className="font-bold text-white text-lg leading-none">
              DevKit
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Your unified dev workspace
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#1e1b4b]/50 border border-[#312e81] rounded-2xl p-6 backdrop-blur">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-[#0f0c29] rounded-lg p-1">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                className={`flex-1 py-2 text-sm rounded-md font-medium transition-all capitalize ${
                  mode === m
                    ? "bg-violet-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="vikas"
                className="w-full bg-[#0f0c29] border border-[#312e81] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="••••••••"
                className="w-full bg-[#0f0c29] border border-[#312e81] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading || !username || !password}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition-colors mt-1"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </button>
          </div>

          {/* Note */}
          {mode === "signup" && (
            <p className="text-xs text-slate-500 mt-4 text-center">
              Your data stays on this machine. No cloud, no sync.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}