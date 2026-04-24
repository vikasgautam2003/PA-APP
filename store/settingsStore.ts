import { create } from "zustand";
import { Store } from "@tauri-apps/plugin-store";

type Theme = "dark" | "light";

let _store: Store | null = null;

async function getStore(): Promise<Store> {
  if (!_store) {
    _store = await Store.load("ares-settings.bin");
  }
  return _store;
}

export async function loadPersistedSettings() {
  try {
    const s = await getStore();
    const key   = await s.get<string>("groq_key") ?? "";
    const theme = await s.get<Theme>("theme") ?? "dark";
    useSettingsStore.setState({ groqKey: key, theme });
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  } catch {}
}

interface SettingsStore {
  theme: Theme;
  groqKey: string;
  setTheme: (t: Theme) => void;
  setGroqKey: (key: string) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  theme: "dark",
  groqKey: "",

  setTheme: (theme) => {
    set({ theme });
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("ares-theme", theme);
    }
    getStore().then((s) => {
      s.set("theme", theme);
      s.save();
    });
  },

  setGroqKey: (key) => {
    set({ groqKey: key });
    getStore().then((s) => {
      s.set("groq_key", key);
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
