import { prisma } from "@/lib/prisma";
import type {
  MaterialContentType,
  MaterialListFilters,
  StudentMaterialListResponse,
} from "@/types/materials";
import {
  buildMaterialListFilterClauses,
  mergeMaterialWhere,
} from "@/server/materials/material-list-filters";
import { buildStudentMaterialAccessWhere } from "@/server/materials/student-material-access";

export class StudentProfileNotFoundError extends Error {
  constructor() {
    super("Perfil de estudante não encontrado");
    this.name = "StudentProfileNotFoundError";
  }
}

export async function listStudentMaterials(
  studentUserId: string,
  params: { page: number; pageSize: number },
  filters: MaterialListFilters = {}
): Promise<StudentMaterialListResponse> {
  const student = await prisma.studentProfile.findUnique({
    where: { userId: studentUserId },
    select: { id: true, classId: true },
  });

  if (!student) {
    throw new StudentProfileNotFoundError();
  }

  const { classId: _ignoredClassFilter, ...studentFilters } = filters;
  void _ignoredClassFilter;

  const where = mergeMaterialWhere(
    buildStudentMaterialAccessWhere(student.id, student.classId),
    ...buildMaterialListFilterClauses(studentFilters)
  );

  const skip = (params.page - 1) * params.pageSize;

  const [total, rows] = await Promise.all([
    prisma.educationalMaterial.count({ where }),
    prisma.educationalMaterial.findMany({
      where,
      orderBy: { sentAt: "desc" },
      skip,
      take: params.pageSize,
      select: {
        id: true,
        title: true,
        description: true,
        discipline: true,
        contentType: true,
        sentAt: true,
        reads: {
          where: { studentId: student.id },
          select: { id: true },
          take: 1,
        },
      },
    }),
  ]);

  return {
    items: rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      discipline: row.discipline,
      contentType: row.contentType as MaterialContentType,
      sentAt: row.sentAt.toISOString(),
      isNew: row.reads.length === 0,
    })),
    page: params.page,
    pageSize: params.pageSize,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / params.pageSize),
  };
}
