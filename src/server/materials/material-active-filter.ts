import type { Prisma } from "@prisma/client";

/** Materiais não excluídos (soft delete). */
export const materialNotDeletedWhere: Prisma.EducationalMaterialWhereInput = {
  deletedAt: null,
};
