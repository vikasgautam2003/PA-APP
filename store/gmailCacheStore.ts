import { create } from "zustand";
import { Store } from "@tauri-apps/plugin-store";
import type { GmailMessage } from "@/lib/gmail";

let _store: Store | null = null;
async function getStore(): Promise<Store> {
  if (!_store) _store = await Store.load("ares-gmail-cache.bin");
  return _store;
}

interface GmailCacheStore {
  emails: GmailMessage[];
  lastFetchAt: number | null;
  setCache: (emails: GmailMessage[]) => void;
  clearCache: () => void;
}

export const useGmailCacheStore = create<GmailCacheStore>((set) => ({
  emails: [],
  lastFetchAt: null,

  setCache: (emails) => {
    const lastFetchAt = Date.now();
    set({ emails, lastFetchAt });
    getStore().then((s) => {
      s.set("emails", emails);
      s.set("last_fetch_at", lastFetchAt);
      s.save();
    });
  },

  clearCache: () => {
    set({ emails: [], lastFetchAt: null });
    getStore().then((s) => {
      s.delete("emails");
      s.delete("last_fetch_at");
      s.save();
    });
  },
}));

export async function loadGmailCache() {
  try {
    const s = await getStore();
    const emails     = await s.get<GmailMessage[]>("emails")       ?? [];
    const lastFetchAt = await s.get<number>("last_fetch_at")        ?? null;
    useGmailCacheStore.setState({ emails, lastFetchAt });
  } catch {}
}
