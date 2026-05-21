"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  isTeacherNavActive,
  TEACHER_NAV_LINKS,
} from "@/features/teacher/components/teacher-nav-links";

export function TeacherSidebar() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Navegação do professor"
      className="hidden w-56 shrink-0 flex-col border-r border-border bg-background md:flex"
    >
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {TEACHER_NAV_LINKS.map(({ href, label }) => {
          const active = isTeacherNavActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-primary/10 aria-[current=page]:text-primary"
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
