"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import {
  isTeacherNavActive,
  TEACHER_NAV_LINKS,
} from "@/features/teacher/components/teacher-nav-links";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function TeacherSidebar() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Navegação lateral do professor"
      className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-card/50 p-4 md:flex lg:w-56"
    >
      <nav className="flex flex-1 flex-col gap-1">
        {TEACHER_NAV_LINKS.map(({ href, label }) => {
          const active = isTeacherNavActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center rounded-xl px-4 text-sm font-medium fluent-transition",
                active
                  ? "bg-primary text-primary-foreground shadow-fluent-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      <Link href="/teacher/conteudos/novo" className="mt-4">
        <Button className="w-full" size="sm">
          <Plus className="size-4" aria-hidden />
          Novo conteúdo
        </Button>
      </Link>
    </aside>
  );
}
