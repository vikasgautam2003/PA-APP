import { create } from "zustand";
import type { User, Session } from "@/types";
import { getSession, logout as authLogout } from "@/lib/auth";

interface AuthStore {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User, session: Session) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user, session) =>
    set({ user, session, isAuthenticated: true, isLoading: false }),

  logout: async () => {
    await authLogout();
    set({ user: null, session: null, isAuthenticated: false });
  },

  initialize: async () => {
    try {
      const session = await getSession();
      if (session) {
        set({
          session,
          user: {
            id: session.user_id,
            username: session.username,
            created_at: "",
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));