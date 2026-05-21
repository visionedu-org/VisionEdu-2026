import type { ClassDashboardData } from "@/types/domain";

const dashboards: Record<string, ClassDashboardData> = {
  "2-A": {
    classLabel: "2º Turma A",
    studentCount: 32,
    averageScore: 6.8,
    topErrors: [
      { concept: "Equações do 1º grau", errorRate: 42 },
      { concept: "Frações equivalentes", errorRate: 38 },
      { concept: "Proporcionalidade", errorRate: 31 },
    ],
  },
  "2-B": {
    classLabel: "2º Turma B",
    studentCount: 28,
    averageScore: 7.2,
    topErrors: [
      { concept: "Função afim", errorRate: 45 },
      { concept: "Sistema de equações", errorRate: 36 },
      { concept: "Geometria plana — área", errorRate: 29 },
    ],
  },
};

export function getClassDashboardFixture(classId: string): ClassDashboardData | null {
  return dashboards[classId] ?? null;
}
