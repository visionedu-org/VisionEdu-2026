"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function AuthHydration({ children }: { children: React.ReactNode }) {
  const hydrateFromCookie = useAuthStore((s) => s.hydrateFromCookie);
  const isExpired = useAuthStore((s) => s.isExpired);
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    hydrateFromCookie();
    if (isExpired()) clearSession();
  }, [hydrateFromCookie, isExpired, clearSession]);

  return <>{children}</>;
}
