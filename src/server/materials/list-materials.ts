import { prisma } from "@/lib/prisma";
import type { MaterialContentType, MaterialListFilters, MaterialListResponse } from "@/types/materials";
import { assertTeacherOwnsClass } from "@/server/materials/assert-teacher-class";
import { TeacherProfileNotFoundError } from "@/server/materials/create-material";
import {
  buildMaterialListFilterClauses,
  mergeMaterialWhere,
} from "@/server/materials/material-list-filters";
import { materialNotDeletedWhere } from "@/server/materials/material-active-filter";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export function parseMaterialsPagination(searchParams: URLSearchParams): {
  page: number;
  pageSize: number;
} {
  const rawPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const rawPageSize = Number.parseInt(
    searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE),
    10
  );

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize =
    Number.isFinite(rawPageSize) && rawPageSize > 0
      ? Math.min(rawPageSize, MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;

  return { page, pageSize };
}

export async function listMaterials(
  teacherUserId: string,
  params: { page: number; pageSize: number },
  filters: MaterialListFilters = {}
): Promise<MaterialListResponse> {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId: teacherUserId },
    select: { id: true },
  });

  if (!teacher) {
    throw new TeacherProfileNotFoundError();
  }

  if (filters.classId) {
    await assertTeacherOwnsClass(teacher.id, filters.classId);
  }

  const where = mergeMaterialWhere(
    { teacherId: teacher.id },
    materialNotDeletedWhere,
    ...buildMaterialListFilterClauses(filters)
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
        _count: { select: { recipients: true } },
        recipients: {
          select: {
            class: { select: { label: true } },
          },
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
      recipientCount: row._count.recipients,
      classLabels: row.recipients.map((recipient) => recipient.class.label),
    })),
    page: params.page,
    pageSize: params.pageSize,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / params.pageSize),
  };
}
