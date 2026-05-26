import { prisma } from "@/lib/prisma";
import { mapLearningPathToModules } from "@/server/learning-path/map-learning-path-modules";
import { getStudentContext } from "@/server/student/get-student-context";
import type { LearningPathModule } from "@/types/domain";

export interface StudentLearningPath {
  pathId: string | null;
  pathTitle: string | null;
  pathSummary: string | null;
  modules: LearningPathModule[];
}

export async function getStudentLearningPath(
  studentUserId: string
): Promise<StudentLearningPath> {
  const { studentId } = await getStudentContext(studentUserId);

  const path = await prisma.studentLearningPath.findFirst({
    where: { studentId, isActive: true },
    include: { steps: { orderBy: { orderIndex: "asc" } } },
  });

  if (!path) {
    return {
      pathId: null,
      pathTitle: null,
      pathSummary: null,
      modules: [],
    };
  }

  return {
    pathId: path.id,
    pathTitle: path.title,
    pathSummary: path.summary,
    modules: mapLearningPathToModules(path),
  };
}
