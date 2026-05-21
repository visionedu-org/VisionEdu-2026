import { http, HttpResponse } from "msw";
import type { ActivityAnswer } from "@/types/domain";
import {
  demoActivities,
  demoLearningPathModules,
  demoStudentDashboard,
} from "@/mocks/data/student-fixtures";
import {
  applyActivityCompletion,
  getProfile,
} from "@/mocks/gamification-memory";
import { getActivityById } from "@/mocks/teacher-content-memory";

function resolveActivity(id: string) {
  return demoActivities[id] ?? getActivityById(id);
}

export const studentHandlers = [
  http.get("/api/v1/students/me/dashboard", () => {
    return HttpResponse.json(demoStudentDashboard);
  }),

  http.get("/api/v1/students/me/learning-path", () => {
    return HttpResponse.json({ modules: demoLearningPathModules });
  }),

  http.get("/api/v1/students/me/profile", () => {
    return HttpResponse.json(getProfile());
  }),

  http.get("/api/v1/activities/:id", ({ params }) => {
    const id = String(params.id);
    const activity = resolveActivity(id);
    if (!activity) {
      return HttpResponse.json(
        { message: "Atividade não encontrada" },
        { status: 404 }
      );
    }
    return HttpResponse.json(activity);
  }),

  http.post("/api/v1/students/activities/:id/submit", async ({ params, request }) => {
    const id = String(params.id);
    if (!resolveActivity(id)) {
      return HttpResponse.json(
        { message: "Atividade não encontrada" },
        { status: 404 }
      );
    }
    const body = (await request.json()) as { answers?: ActivityAnswer[] };
    const result = applyActivityCompletion(id, body.answers ?? []);
    return HttpResponse.json(result);
  }),
];
