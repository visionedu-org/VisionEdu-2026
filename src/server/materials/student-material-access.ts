import { materialNotDeletedWhere } from "@/server/materials/material-active-filter";

/** Filtro de materiais visíveis ao aluno (turma inteira ou destinatário individual). */
export function buildStudentMaterialAccessWhere(
  studentProfileId: string,
  classId: string
) {
  return {
    ...materialNotDeletedWhere,
    OR: [
      {
        recipients: {
          some: {
            targetType: "class" as const,
            classId,
          },
        },
      },
      {
        recipients: {
          some: {
            targetType: "student" as const,
            studentId: studentProfileId,
          },
        },
      },
    ],
  };
}
