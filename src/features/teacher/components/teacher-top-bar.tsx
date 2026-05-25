"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  isTeacherNavActive,
  TEACHER_NAV_LINKS,
} from "@/features/teacher/components/teacher-nav-links";
import { cn } from "@/lib/utils";
import { UserProfileMenu } from "@/components/layout/user-profile-menu";

export function TeacherTopBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 hidden bg-background/95 backdrop-blur-md md:block">
      <div className="flex w-full items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-8">
        <nav
          aria-label="Navegação principal do professor"
          className="flex flex-1 items-center justify-center"
        >
          <div className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border/60 bg-card px-2 py-1.5 shadow-fluent-sm">
            {TEACHER_NAV_LINKS.map(({ href, label }) => {
              const active = isTeacherNavActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium fluent-transition",
                    active
                      ? "bg-primary text-primary-foreground shadow-fluent-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>

        <UserProfileMenu roleLabel="Professor" className="shrink-0" />
      </div>
    </header>
  );
}
