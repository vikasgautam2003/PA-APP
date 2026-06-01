import { create } from "zustand";

export interface AppError {
  id: string;
  message: string;
  detail?: string;
  count: number;       // how many times this same error has recurred
  firstTs: number;
  lastTs: number;
}

interface ErrorStore {
  errors: AppError[];
  minimized: boolean;
  report: (message: string, detail?: string) => void;
  dismiss: (id: string) => void;
  clear: () => void;
  setMinimized: (v: boolean) => void;
}

const MAX_ERRORS = 25;

function slug(message: string): string {
  return message.trim().slice(0, 240).replace(/\s+/g, " ");
}

export const useErrorStore = create<ErrorStore>((set) => ({
  errors: [],
  minimized: false,
  report: (rawMessage, detail) => {
    const message = slug(rawMessage || "Unknown error");
    if (!message) return;
    set((s) => {
      const now = Date.now();
      const existing = s.errors.find((e) => e.message === message);
      if (existing) {
        // Recurring — bump the count and float it to the top, don't re-pop.
        const updated = s.errors.map((e) =>
          e.id === existing.id
            ? { ...e, count: e.count + 1, lastTs: now, detail: detail ?? e.detail }
            : e
        );
        return { errors: updated };
      }
      const next: AppError = {
        id: `${now}-${Math.random().toString(36).slice(2, 7)}`,
        message, detail, count: 1, firstTs: now, lastTs: now,
      };
      // Newest first, cap the list.
      return { errors: [next, ...s.errors].slice(0, MAX_ERRORS), minimized: false };
    });
  },
  dismiss: (id) => set((s) => ({ errors: s.errors.filter((e) => e.id !== id) })),
  clear: () => set({ errors: [], minimized: false }),
  setMinimized: (minimized) => set({ minimized }),
}));

/** Imperative reporter for use outside React (catch blocks, libs). */
export function reportError(message: string, detail?: string) {
  try { useErrorStore.getState().report(message, detail); } catch { /* noop */ }
}
