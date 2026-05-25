import { prisma } from "@/lib/prisma";
import { demoStudentDashboard } from "@/mocks/data/student-fixtures";
import { buildStudentMaterialAccessWhere } from "@/server/materials/student-material-access";
import { getStudentContext } from "@/server/student/get-student-context";
import type { StudentDashboardData } from "@/types/domain";

async function getStudentMaterialStats(
  studentId: string,
  classId: string
): Promise<{ materialsTotal: number; materialsViewed: number }> {
  const accessWhere = buildStudentMaterialAccessWhere(studentId, classId);

  const [materialsTotal, materialsViewed] = await Promise.all([
    prisma.educationalMaterial.count({ where: accessWhere }),
    prisma.materialRead.count({
      where: {
        studentId,
        material: accessWhere,
      },
    }),
  ]);

  return { materialsTotal, materialsViewed };
}

export async function getStudentDashboard(
  studentUserId: string
): Promise<StudentDashboardData> {
  const ctx = await getStudentContext(studentUserId);
  const { materialsTotal, materialsViewed } = await getStudentMaterialStats(
    ctx.studentId,
    ctx.classId
  );

  return {
    ...demoStudentDashboard,
    schoolName: ctx.schoolName,
    grade: ctx.grade,
    classIdentifier: ctx.classIdentifier,
    materialsTotal,
    materialsViewed,
  };
}
