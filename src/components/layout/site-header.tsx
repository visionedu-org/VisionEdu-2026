"use client";

import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/layout/brand-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const HIDDEN_PREFIXES = [
  "/",
  "/student",
  "/teacher",
  "/login",
  "/register",
];

export function SiteHeader() {
  const pathname = usePathname();
  const hidden = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));

  if (hidden) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-md supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandLogo />
        <ThemeToggle />
      </div>
    </header>
  );
}
