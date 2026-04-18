import { create } from "zustand";

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  authChecked: boolean;
  setAuth: (user: User, token: string) => void;
  markAuthChecked: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  authChecked: false,
  setAuth: (user, token) => set({ user, accessToken: token, authChecked: true }),
  markAuthChecked: () => set({ authChecked: true }),
  clearAuth: () => set({ user: null, accessToken: null, authChecked: true }),
}));
