import { create } from "zustand";

type Theme = "dark" | "light";

interface SettingsStore {
  theme: Theme;
  geminiKey: string;
  setTheme: (theme: Theme) => void;
  setGeminiKey: (key: string) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  theme: "dark",
  geminiKey: "",
  setTheme: (theme) => {
    set({ theme });
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("devkit-theme", theme);
    }
  },
  setGeminiKey: (key) => set({ geminiKey: key }),
}));

export function initTheme() {
  if (typeof document === "undefined") return;
  const saved = (localStorage.getItem("devkit-theme") as Theme) ?? "dark";
  document.documentElement.setAttribute("data-theme", saved);
  useSettingsStore.setState({ theme: saved });
}
