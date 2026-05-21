"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListChecks, User } from "lucide-react";

const tabs = [
  { href: "/student/dashboard", label: "Início", icon: Home },
  { href: "/student/atividades", label: "Atividades", icon: ListChecks },
  { href: "/student/perfil", label: "Perfil", icon: User },
] as const;

export function StudentBottomNav() {
  const pathname = usePathname();

  if (pathname.includes("/student/atividade/")) {
    return null;
  }

  return (
    <nav
      aria-label="Navegação principal do aluno"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[padding:max(0px)]:pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto grid max-w-lg grid-cols-3">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/student/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="flex min-h-11 flex-col items-center justify-center gap-0.5 px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:text-primary"
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
