import type { BadgeDefinition, BadgeId } from "@/types/domain";

export const BADGE_CATALOG: Record<BadgeId, BadgeDefinition> = {
  first_activity: {
    id: "first_activity",
    title: "Primeira atividade",
    description: "Concluiu sua primeira atividade na plataforma.",
    icon: "trophy",
  },
  high_score: {
    id: "high_score",
    title: "Nota de ouro",
    description: "Obteve nota 9 ou superior em uma atividade.",
    icon: "star",
  },
  path_starter: {
    id: "path_starter",
    title: "Na trilha",
    description: "Concluiu atividade do módulo em progresso na trilha.",
    icon: "route",
  },
};

export function titleForBadge(id: BadgeId): string {
  return BADGE_CATALOG[id]?.title ?? id;
}
