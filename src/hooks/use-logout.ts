"use client";

import { useRouter } from "next/navigation";
import { clearEnemProgressHydration } from "@/lib/enem/storage";
import { useAuthStore } from "@/stores/auth-store";
import { authService } from "@/services/auth.service";

export function useLogout() {
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);

  return async function logout() {
    try {
      await authService.logout();
    } finally {
      clearEnemProgressHydration();
      clearSession();
      router.push("/login");
    }
  };
}
