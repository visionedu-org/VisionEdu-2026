import { demoStudentDashboard } from "@/mocks/data/student-fixtures";
import type { StudentDashboardData } from "@/types/domain";
import { getStudentContext } from "@/server/student/get-student-context";

export async function getStudentDashboard(
  studentUserId: string
): Promise<StudentDashboardData> {
  const ctx = await getStudentContext(studentUserId);

  return {
    ...demoStudentDashboard,
    schoolName: ctx.schoolName,
    grade: ctx.grade,
    classIdentifier: ctx.classIdentifier,
  };
}
