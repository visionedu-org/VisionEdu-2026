import { Route, Star, Trophy } from "lucide-react";
import { BADGE_CATALOG } from "@/mocks/data/student-gamification";
import type { StudentBadgeState } from "@/types/domain";

const ICON_MAP = {
  trophy: Trophy,
  star: Star,
  route: Route,
} as const;

interface BadgeGridProps {
  badges: StudentBadgeState[];
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  return (
    <section aria-labelledby="badges-heading">
      <h2 id="badges-heading" className="text-lg font-semibold">
        Conquistas
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {badges.map((badge) => {
          const def = BADGE_CATALOG[badge.id];
          const Icon = ICON_MAP[def.icon];
          const unlocked = badge.unlockedAt !== null;

          return (
            <li
              key={badge.id}
              className={`flex min-h-11 gap-3 rounded-xl border border-border p-3 ${
                unlocked ? "bg-card" : "bg-muted/20 opacity-50"
              }`}
              aria-label={
                unlocked
                  ? `Badge ${def.title}, desbloqueado`
                  : `Badge ${def.title}, bloqueado`
              }
            >
              <Icon className="size-8 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="font-medium text-foreground">{def.title}</p>
                <p className="text-sm text-muted-foreground">{def.description}</p>
                {!unlocked ? (
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    Bloqueado
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
