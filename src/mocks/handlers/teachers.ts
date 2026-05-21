import { http, HttpResponse } from "msw";
import { getBnccGapsForClass } from "@/mocks/data/bncc-competencies";
import { demoActivities } from "@/mocks/data/student-fixtures";
import { getClassDashboardFixture } from "@/mocks/data/teacher-fixtures";
import {
  addActivity,
  addContent,
  getActivityById,
} from "@/mocks/teacher-content-memory";
import type {
  BnccGapRow,
  TeacherActivityCreatePayload,
  TeacherContent,
} from "@/types/domain";

function sortBnccGaps(gaps: BnccGapRow[]): BnccGapRow[] {
  return [...gaps].sort((a, b) => a.masteryPercent - b.masteryPercent);
}

export const teacherHandlers = [
  http.get("/api/v1/teachers/classes/:classId/dashboard", ({ params }) => {
    const classId = String(params.classId);
    const dashboard = getClassDashboardFixture(classId);
    if (!dashboard) {
      return HttpResponse.json(
        { message: "Turma não encontrada" },
        { status: 404 }
      );
    }
    return HttpResponse.json(dashboard);
  }),

  http.get("/api/v1/teachers/classes/:classId/bncc-gaps", ({ params }) => {
    const classId = String(params.classId);
    const dashboard = getClassDashboardFixture(classId);
    if (!dashboard) {
      return HttpResponse.json(
        { message: "Turma não encontrada" },
        { status: 404 }
      );
    }
    const gaps = sortBnccGaps(getBnccGapsForClass(classId));
    return HttpResponse.json({ gaps });
  }),

  http.post("/api/v1/teachers/contents", async ({ request }) => {
    const body = (await request.json()) as Omit<TeacherContent, "id" | "createdAt">;
    const id = crypto.randomUUID();
    const content: TeacherContent = {
      ...body,
      id,
      createdAt: new Date().toISOString(),
    };
    addContent(content);
    return HttpResponse.json({ id }, { status: 201 });
  }),

  http.get("/api/v1/teachers/activities/:id", ({ params }) => {
    const id = String(params.id);
    const activity = demoActivities[id] ?? getActivityById(id);
    if (!activity) {
      return HttpResponse.json(
        { message: "Atividade não encontrada" },
        { status: 404 }
      );
    }
    return HttpResponse.json(activity);
  }),

  http.post("/api/v1/teachers/activities", async ({ request }) => {
    const body = (await request.json()) as TeacherActivityCreatePayload;
    const id = crypto.randomUUID();
    const activity = addActivity(id, body);
    return HttpResponse.json(
      {
        id,
        title: activity.title,
        questions: activity.questions,
      },
      { status: 201 }
    );
  }),
];
