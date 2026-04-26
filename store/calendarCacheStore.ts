import { create } from "zustand";
import { Store } from "@tauri-apps/plugin-store";
import type { CalendarEvent } from "@/lib/calendar";

let _store: Store | null = null;
async function getStore(): Promise<Store> {
  if (!_store) _store = await Store.load("ares-calendar-cache.bin");
  return _store;
}

interface CalendarCacheStore {
  events: CalendarEvent[];
  lastFetchAt: number | null;
  setCache: (events: CalendarEvent[]) => void;
  clearCache: () => void;
}

export const useCalendarCacheStore = create<CalendarCacheStore>((set) => ({
  events: [],
  lastFetchAt: null,

  setCache: (events) => {
    const lastFetchAt = Date.now();
    set({ events, lastFetchAt });
    getStore().then((s) => {
      s.set("events", events);
      s.set("last_fetch_at", lastFetchAt);
      s.save();
    });
  },

  clearCache: () => {
    set({ events: [], lastFetchAt: null });
    getStore().then((s) => {
      s.delete("events");
      s.delete("last_fetch_at");
      s.save();
    });
  },
}));

export async function loadCalendarCache() {
  try {
    const s           = await getStore();
    const events      = await s.get<CalendarEvent[]>("events")      ?? [];
    const lastFetchAt = await s.get<number>("last_fetch_at")        ?? null;
    useCalendarCacheStore.setState({ events, lastFetchAt });
  } catch {}
}
