import { demoLearningPathModules } from "@/mocks/data/student-fixtures";
import type { LearningPathModule } from "@/types/domain";
import { getStudentContext } from "@/server/student/get-student-context";

export interface StudentLearningPath {
  modules: LearningPathModule[];
}

export async function getStudentLearningPath(
  studentUserId: string
): Promise<StudentLearningPath> {
  await getStudentContext(studentUserId);

  return { modules: demoLearningPathModules };
}
