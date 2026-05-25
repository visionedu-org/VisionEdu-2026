"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useLogout } from "@/hooks/use-logout";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface UserProfileMenuProps {
  roleLabel: string;
  className?: string;
}

export function UserProfileMenu({ roleLabel, className }: UserProfileMenuProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initials = user?.name
    ?.split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-border/60 bg-card py-1.5 pl-1.5 pr-3 shadow-fluent-sm fluent-transition",
          "hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/40"
        )}
      >
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
          aria-hidden
        >
          {initials ?? "?"}
        </span>
        <span className="hidden min-w-0 text-left sm:block">
          <span className="block truncate text-sm font-semibold leading-tight">
            {user?.name ?? "Usuário"}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {roleLabel}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground fluent-transition",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[14rem] overflow-hidden rounded-2xl border border-border/60 bg-card py-1 shadow-fluent-lg"
        >
          <div className="border-b border-border/60 px-4 py-3">
            <p className="truncate text-sm font-semibold">
              {user?.name ?? "Usuário"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email}
            </p>
          </div>
          <div className="p-1">
            <Button
              type="button"
              variant="ghost"
              role="menuitem"
              className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={loggingOut}
              onClick={handleLogout}
            >
              <LogOut className="size-4" aria-hidden />
              {loggingOut ? "Saindo…" : "Sair da conta"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
