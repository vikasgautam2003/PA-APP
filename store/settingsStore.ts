import { create } from "zustand";
import { Store } from "@tauri-apps/plugin-store";

type Theme = "dark" | "light";

let _store: Store | null = null;

async function getStore(): Promise<Store> {
  if (!_store) _store = await Store.load("ares-settings.bin");
  return _store;
}

export async function loadPersistedSettings() {
  try {
    const s = await getStore();
    const groqKey           = await s.get<string>("groq_key")           ?? "";
    const theme             = await s.get<Theme>("theme")               ?? "dark";
    const gmailToken        = await s.get<string>("gmail_token")        ?? "";
    const gmailRefreshToken = await s.get<string>("gmail_refresh_token") ?? "";
    const gmailClientId     = await s.get<string>("gmail_client_id")    ?? "";
    const gmailClientSecret = await s.get<string>("gmail_client_secret") ?? "";
    useSettingsStore.setState({ groqKey, theme, gmailToken, gmailRefreshToken, gmailClientId, gmailClientSecret });
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  } catch {}
}

interface SettingsStore {
  theme: Theme;
  groqKey: string;
  gmailToken: string;
  gmailRefreshToken: string;
  gmailClientId: string;
  gmailClientSecret: string;
  setTheme: (t: Theme) => void;
  setGroqKey: (key: string) => void;
  setGmailTokens: (access: string, refresh: string) => void;
  setGmailCredentials: (clientId: string, clientSecret: string) => void;
  clearGmail: () => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  theme: "dark",
  groqKey: "",
  gmailToken: "",
  gmailRefreshToken: "",
  gmailClientId: "",
  gmailClientSecret: "",

  setTheme: (theme) => {
    set({ theme });
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("ares-theme", theme);
    }
    getStore().then((s) => { s.set("theme", theme); s.save(); });
  },

  setGroqKey: (key) => {
    set({ groqKey: key });
    getStore().then((s) => { s.set("groq_key", key); s.save(); });
  },

  setGmailTokens: (access, refresh) => {
    set({ gmailToken: access, gmailRefreshToken: refresh });
    getStore().then((s) => {
      s.set("gmail_token", access);
      s.set("gmail_refresh_token", refresh);
      s.save();
    });
  },

  setGmailCredentials: (clientId, clientSecret) => {
    set({ gmailClientId: clientId, gmailClientSecret: clientSecret });
    getStore().then((s) => {
      s.set("gmail_client_id", clientId);
      s.set("gmail_client_secret", clientSecret);
      s.save();
    });
  },

  clearGmail: () => {
    set({ gmailToken: "", gmailRefreshToken: "" });
    getStore().then((s) => {
      s.delete("gmail_token");
      s.delete("gmail_refresh_token");
      s.save();
    });
  },
}));

export function initTheme() {
  if (typeof document === "undefined") return;
  const saved = (localStorage.getItem("ares-theme") as Theme) ?? "dark";
  document.documentElement.setAttribute("data-theme", saved);
  useSettingsStore.setState({ theme: saved });
}
