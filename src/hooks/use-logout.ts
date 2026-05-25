"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { authService } from "@/services/auth.service";

export function useLogout() {
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);

  return async function logout() {
    try {
      await authService.logout();
    } finally {
      clearSession();
      router.push("/login");
    }
  };
}
