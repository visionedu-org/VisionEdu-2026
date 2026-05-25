import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  href?: string;
  showBadge?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { icon: "size-7", text: "text-base", badge: "text-[10px]" },
  md: { icon: "size-8", text: "text-lg", badge: "text-xs" },
  lg: { icon: "size-10", text: "text-xl", badge: "text-xs" },
};

export function BrandLogo({
  href = "/login",
  showBadge = true,
  className,
  size = "md",
}: BrandLogoProps) {
  const s = sizeMap[size];

  const content = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-fluent-sm",
          s.icon
        )}
        aria-hidden
      >
        <GraduationCap className="size-[55%]" />
      </span>
      <span className={cn("font-bold tracking-tight text-foreground", s.text)}>
        VisionEdu
      </span>
      {showBadge && (
        <span
          className={cn(
            "rounded-full bg-accent px-2 py-0.5 font-medium text-accent-foreground",
            s.badge
          )}
        >
          CETI
        </span>
      )}
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="fluent-transition hover:opacity-80">
      {content}
    </Link>
  );
}
