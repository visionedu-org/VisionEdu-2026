"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";

export function AuthHeader() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  return (
    <div className="border-b border-border bg-background/80 px-4 py-3 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{user?.name ?? "Usuário"}</p>
        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
        Sair
      </Button>
    </div>
  );
}
