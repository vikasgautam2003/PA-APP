import { create } from "zustand";
import { Store } from "@tauri-apps/plugin-store";
import type { GmailMessage } from "@/lib/gmail";

// Bump this when GmailMessage shape changes to force a fresh fetch
const CACHE_VERSION = 4;

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
      s.set("cache_version", CACHE_VERSION);
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
    const version = await s.get<number>("cache_version") ?? 0;
    if (version < CACHE_VERSION) {
      // Shape changed — discard stale data so useGmail triggers a fresh fetch
      await s.delete("emails");
      await s.delete("last_fetch_at");
      await s.set("cache_version", CACHE_VERSION);
      await s.save();
      return;
    }
    const emails      = await s.get<GmailMessage[]>("emails")    ?? [];
    const lastFetchAt = await s.get<number>("last_fetch_at")      ?? null;
    useGmailCacheStore.setState({ emails, lastFetchAt });
  } catch {}
}
