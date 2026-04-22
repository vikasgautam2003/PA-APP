import { create } from "zustand";

type Theme = "dark" | "light";

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
      localStorage.setItem("devkit-theme", theme);
    }
  },
  setGroqKey: (key) => set({ groqKey: key }),
}));

export function initTheme() {
  if (typeof document === "undefined") return;
  const saved = (localStorage.getItem("devkit-theme") as Theme) ?? "dark";
  document.documentElement.setAttribute("data-theme", saved);
  useSettingsStore.setState({ theme: saved });
}
