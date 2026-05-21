import type { ClassGroup } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { pilotSchools } from "@/mocks/data/ceti-seed";

function buildClassLabel(grade: string, classIdentifier: string): string {
  return `${grade}º ano — Turma ${classIdentifier}`;
}

async function ensureSchoolExists(schoolId: string): Promise<void> {
  const exists = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { id: true },
  });
  if (exists) return;

  const pilot = pilotSchools.find((s) => s.id === schoolId);

  await prisma.school.create({
    data: {
      id: schoolId,
      name: pilot?.name ?? "Escola",
      gre: pilot?.gre ?? null,
      city: pilot?.city ?? null,
    },
  });
}

export async function findOrCreateClassGroup(params: {
  schoolId: string;
  grade: string;
  classIdentifier: string;
}): Promise<ClassGroup> {
  await ensureSchoolExists(params.schoolId);

  const label = buildClassLabel(params.grade, params.classIdentifier);

  return prisma.classGroup.upsert({
    where: {
      schoolId_grade_classIdentifier: {
        schoolId: params.schoolId,
        grade: params.grade,
        classIdentifier: params.classIdentifier,
      },
    },
    create: {
      schoolId: params.schoolId,
      grade: params.grade,
      classIdentifier: params.classIdentifier,
      label,
    },
    update: {},
  });
}
