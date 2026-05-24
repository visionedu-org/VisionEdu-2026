import type { Prisma } from "@prisma/client";
import type { MaterialListFilters } from "@/types/materials";

function startOfDay(dateInput: string): Date {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Data inválida");
  }
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(dateInput: string): Date {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Data inválida");
  }
  date.setHours(23, 59, 59, 999);
  return date;
}

/** Cláusulas de filtro reutilizáveis (disciplina, tipo, período, busca). */
export function buildMaterialListFilterClauses(
  filters: MaterialListFilters
): Prisma.EducationalMaterialWhereInput[] {
  const clauses: Prisma.EducationalMaterialWhereInput[] = [];

  if (filters.discipline) {
    clauses.push({ discipline: filters.discipline });
  }

  if (filters.contentType) {
    clauses.push({ contentType: filters.contentType });
  }

  if (filters.dateFrom || filters.dateTo) {
    const sentAt: Prisma.DateTimeFilter = {};
    if (filters.dateFrom) {
      sentAt.gte = startOfDay(filters.dateFrom);
    }
    if (filters.dateTo) {
      sentAt.lte = endOfDay(filters.dateTo);
    }
    clauses.push({ sentAt });
  }

  if (filters.q) {
    clauses.push({
      OR: [
        { title: { contains: filters.q, mode: "insensitive" } },
        { description: { contains: filters.q, mode: "insensitive" } },
      ],
    });
  }

  if (filters.classId) {
    clauses.push({
      recipients: {
        some: { classId: filters.classId },
      },
    });
  }

  return clauses;
}

export function mergeMaterialWhere(
  ...parts: Prisma.EducationalMaterialWhereInput[]
): Prisma.EducationalMaterialWhereInput {
  const normalized = parts.filter(
    (part) => Object.keys(part).length > 0
  );
  if (normalized.length === 0) return {};
  if (normalized.length === 1) return normalized[0]!;
  return { AND: normalized };
}
