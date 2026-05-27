import type {
  Activity,
  LearningPathModule,
  StudentDashboardData,
} from "@/types/domain";
import { cetiSchool } from "@/mocks/data/ceti-seed";

/** Demo activity — use in README deep links */
export const DEMO_ACTIVITY_ID = "550e8400-e29b-41d4-a716-446655440000";
const DEMO_ACTIVITY_ID_2 = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

const mcqTemplate = (prefix: string, count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-q${i + 1}`,
    prompt: `Questão ${i + 1}: Qual alternativa está correta?`,
    options: [
      { id: `${prefix}-q${i + 1}-a`, text: "Alternativa A" },
      { id: `${prefix}-q${i + 1}-b`, text: "Alternativa B" },
      { id: `${prefix}-q${i + 1}-c`, text: "Alternativa C" },
      { id: `${prefix}-q${i + 1}-d`, text: "Alternativa D" },
    ],
  }));

export const demoActivities: Record<string, Activity> = {
  [DEMO_ACTIVITY_ID]: {
    id: DEMO_ACTIVITY_ID,
    title: "Diagnóstico — Equações 1º grau",
    description: "Atividade compartilhada pela Professora Regina (demonstração).",
    questions: mcqTemplate("diag1", 5),
  },
  [DEMO_ACTIVITY_ID_2]: {
    id: DEMO_ACTIVITY_ID_2,
    title: "Revisão — Funções afim",
    description: "Segunda atividade demo do CETI.",
    questions: mcqTemplate("rev1", 5),
  },
};

export const demoLearningPathModules: LearningPathModule[] = [
  {
    id: "mod-1",
    title: "Introdução",
    status: "completed",
    activityId: DEMO_ACTIVITY_ID,
  },
  {
    id: "mod-2",
    title: "Equações",
    status: "in_progress",
    activityId: DEMO_ACTIVITY_ID,
  },
  {
    id: "mod-3",
    title: "Funções",
    status: "locked",
    activityId: DEMO_ACTIVITY_ID_2,
  },
  {
    id: "mod-4",
    title: "Geometria",
    status: "locked",
  },
  {
    id: "mod-5",
    title: "Prova simulado",
    status: "locked",
    activityId: DEMO_ACTIVITY_ID_2,
  },
];

export const demoStudentDashboard: StudentDashboardData = {
  schoolName: cetiSchool.name,
  grade: "2",
  classIdentifier: "A",
  averageScore: 7.4,
  activitiesCompleted: 3,
  activitiesTotal: 8,
  materialsViewed: 5,
  materialsTotal: 12,
  pendingActivities: [
    {
      id: DEMO_ACTIVITY_ID,
      title: demoActivities[DEMO_ACTIVITY_ID].title,
      status: "in_progress",
    },
    {
      id: DEMO_ACTIVITY_ID_2,
      title: demoActivities[DEMO_ACTIVITY_ID_2].title,
      status: "not_started",
    },
  ],
};
