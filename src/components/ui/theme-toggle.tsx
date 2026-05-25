"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="size-10 animate-pulse rounded-xl bg-muted" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative flex size-10 items-center justify-center rounded-xl border border-border/60 bg-card text-foreground shadow-fluent-sm fluent-transition",
        "hover:bg-muted hover:shadow-fluent-md focus-visible:ring-3 focus-visible:ring-ring/40"
      )}
      aria-label="Alternar tema claro ou escuro"
    >
      {isDark ? (
        <Sun className="size-5 text-brand-yellow" />
      ) : (
        <Moon className="size-5 text-primary" />
      )}
    </button>
  );
}
