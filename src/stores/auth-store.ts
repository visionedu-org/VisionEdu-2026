"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse, User, UserRole } from "@/types/domain";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  role: UserRole | null;
  expiresAt: number | null;
  setSession: (response: AuthResponse) => void;
  clearSession: () => void;
  isExpired: () => boolean;
  hydrateFromCookie: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      role: null,
      expiresAt: null,

      setSession: (response) => {
        const expiresAt = Date.now() + response.expires_in * 1000;
        set({
          accessToken: response.access_token,
          user: response.user,
          role: response.user.role,
          expiresAt,
        });
      },

      clearSession: () => {
        set({
          accessToken: null,
          user: null,
          role: null,
          expiresAt: null,
        });
      },

      isExpired: () => {
        const { expiresAt } = get();
        if (!expiresAt) return true;
        return Date.now() > expiresAt;
      },

      hydrateFromCookie: () => {
        if (get().isExpired()) {
          get().clearSession();
        }
      },
    }),
    { name: "visionedu-auth" }
  )
);
