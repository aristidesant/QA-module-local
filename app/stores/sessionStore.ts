import { create } from "zustand";
import type { UserModel } from "~/models/UserModels";

interface SessionState {
  user: UserModel | null;
  token: string | null;
  setUser: (user: UserModel | null) => void;
  setToken: (token: string | null) => void;
  clearUser: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  token: null,
  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
