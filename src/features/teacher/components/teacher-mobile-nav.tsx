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

export function TeacherMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border bg-background px-4 py-2 md:hidden">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="min-h-11 min-w-11"
              aria-label="Abrir menu de navegação"
            />
          }
        >
          <Menu className="size-5" aria-hidden />
          <span className="sr-only">Menu</span>
        </DialogTrigger>
        <DialogContent
          showCloseButton
          className="fixed top-0 left-0 h-full max-h-none w-[min(18rem,85vw)] max-w-none translate-x-0 translate-y-0 rounded-none rounded-r-xl border-r p-0 data-open:slide-in-from-left data-closed:slide-out-to-left sm:max-w-none"
        >
          <DialogHeader className="border-b border-border px-4 py-4">
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
                  className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-primary/10 aria-[current=page]:text-primary"
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </DialogContent>
      </Dialog>
    </div>
  );
}
