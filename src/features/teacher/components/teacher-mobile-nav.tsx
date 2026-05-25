"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  isTeacherNavActive,
  TEACHER_NAV_LINKS,
} from "@/features/teacher/components/teacher-nav-links";
import { UserProfileMenu } from "@/components/layout/user-profile-menu";
import { cn } from "@/lib/utils";

export function TeacherMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-background/95 px-4 py-2 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-between gap-3">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Abrir menu de navegação"
              />
            }
          >
            <Menu className="size-5" aria-hidden />
          </DialogTrigger>
          <DialogContent
            showCloseButton
            className="fixed top-0 left-0 h-full max-h-none w-[min(18rem,85vw)] max-w-none translate-x-0 translate-y-0 rounded-none rounded-r-2xl border-r p-0 data-open:slide-in-from-left data-closed:slide-out-to-left sm:max-w-none"
          >
            <DialogHeader className="border-b border-border/60 px-5 py-5">
              <DialogTitle>Menu do professor</DialogTitle>
            </DialogHeader>
            <nav
              aria-label="Navegação do professor"
              className="flex flex-col gap-1 p-4"
            >
              {TEACHER_NAV_LINKS.map(({ href, label }) => {
                const active = isTeacherNavActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
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
          </DialogContent>
        </Dialog>

        <UserProfileMenu roleLabel="Professor" />
      </div>
    </header>
  );
}
