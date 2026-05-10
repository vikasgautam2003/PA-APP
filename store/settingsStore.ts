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
    const serpapiKey        = await s.get<string>("serpapi_key")        ?? "";
    const theme             = await s.get<Theme>("theme")               ?? "dark";
    const gmailToken        = await s.get<string>("gmail_token")        ?? "";
    const gmailRefreshToken = await s.get<string>("gmail_refresh_token") ?? "";
    const gmailClientId     = await s.get<string>("gmail_client_id")    ?? "";
    const gmailClientSecret = await s.get<string>("gmail_client_secret") ?? "";
    const notifMeetingAlert = await s.get<boolean>("notif_meeting_alert") ?? true;
    const notifDsaNudgeTime = await s.get<string>("notif_dsa_nudge_time") ?? "20:00";
    const notifBriefTime    = await s.get<string>("notif_brief_time")    ?? "08:00";
    const notifEnabled      = await s.get<boolean>("notif_enabled")      ?? true;
    useSettingsStore.setState({
      groqKey, serpapiKey, theme, gmailToken, gmailRefreshToken, gmailClientId, gmailClientSecret,
      notifMeetingAlert, notifDsaNudgeTime, notifBriefTime, notifEnabled,
    });
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  } catch {}
}

interface SettingsStore {
  theme: Theme;
  groqKey: string;
  serpapiKey: string;
  gmailToken: string;
  gmailRefreshToken: string;
  gmailClientId: string;
  gmailClientSecret: string;
  notifEnabled: boolean;
  notifMeetingAlert: boolean;
  notifDsaNudgeTime: string;
  notifBriefTime: string;
  setTheme: (t: Theme) => void;
  setGroqKey: (key: string) => void;
  setSerpapiKey: (key: string) => void;
  setGmailTokens: (access: string, refresh: string) => void;
  setGmailCredentials: (clientId: string, clientSecret: string) => void;
  clearGmail: () => void;
  setNotifEnabled: (v: boolean) => void;
  setNotifMeetingAlert: (v: boolean) => void;
  setNotifDsaNudgeTime: (v: string) => void;
  setNotifBriefTime: (v: string) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  theme: "dark",
  groqKey: "",
  serpapiKey: "",
  gmailToken: "",
  gmailRefreshToken: "",
  gmailClientId: "",
  gmailClientSecret: "",
  notifEnabled: true,
  notifMeetingAlert: true,
  notifDsaNudgeTime: "20:00",
  notifBriefTime: "08:00",

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

  setSerpapiKey: (key) => {
    set({ serpapiKey: key });
    getStore().then((s) => { s.set("serpapi_key", key); s.save(); });
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

  setNotifEnabled: (v) => {
    set({ notifEnabled: v });
    getStore().then((s) => { s.set("notif_enabled", v); s.save(); });
  },
  setNotifMeetingAlert: (v) => {
    set({ notifMeetingAlert: v });
    getStore().then((s) => { s.set("notif_meeting_alert", v); s.save(); });
  },
  setNotifDsaNudgeTime: (v) => {
    set({ notifDsaNudgeTime: v });
    getStore().then((s) => { s.set("notif_dsa_nudge_time", v); s.save(); });
  },
  setNotifBriefTime: (v) => {
    set({ notifBriefTime: v });
    getStore().then((s) => { s.set("notif_brief_time", v); s.save(); });
  },
}));

export function initTheme() {
  if (typeof document === "undefined") return;
  const saved = (localStorage.getItem("ares-theme") as Theme) ?? "dark";
  document.documentElement.setAttribute("data-theme", saved);
  useSettingsStore.setState({ theme: saved });
}
