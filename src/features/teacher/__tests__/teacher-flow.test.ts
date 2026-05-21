import { describe, expect, it } from "vitest";
import { teacherService } from "@/services/teacher.service";
import { DEMO_ACTIVITY_ID } from "@/mocks/data/student-fixtures";

describe("teacher MSW flows", () => {
  it("getClassDashboard returns class metrics", async () => {
    const dash = await teacherService.getClassDashboard("2-A");
    expect(dash.classLabel).toContain("Turma");
    expect(dash.studentCount).toBeGreaterThan(0);
    expect(dash.averageScore).toBeGreaterThan(0);
    expect(dash.topErrors.length).toBeGreaterThanOrEqual(1);
  });

  it("getBnccGaps returns at least six competencies", async () => {
    const { gaps } = await teacherService.getBnccGaps("2-A");
    expect(gaps.length).toBeGreaterThanOrEqual(6);
    const sorted = [...gaps].sort(
      (a, b) => a.masteryPercent - b.masteryPercent
    );
    expect(gaps.map((g) => g.masteryPercent)).toEqual(
      sorted.map((g) => g.masteryPercent)
    );
  });

  it("createActivity and getActivity roundtrip", async () => {
    const created = await teacherService.createActivity({
      title: "Diagnóstico teste MSW",
      description: "Criado nos testes da Fase 4",
      grade: "2",
      class_identifier: "A",
      questions: [
        {
          prompt: "2 + 2 = ?",
          options: ["3", "4", "5", "6"],
          bnccCode: "EM13MAT302",
          correctOptionIndex: 1,
        },
      ],
    });
    expect(created.id.length).toBeGreaterThan(0);
    expect(created.questions).toHaveLength(1);

    const fetched = await teacherService.getActivity(created.id);
    expect(fetched.id).toBe(created.id);
    expect(fetched.title).toBe("Diagnóstico teste MSW");
    expect(fetched.questions).toHaveLength(1);
  });

  it("getActivity resolves demo fixture id", async () => {
    const activity = await teacherService.getActivity(DEMO_ACTIVITY_ID);
    expect(activity.questions.length).toBeGreaterThan(0);
  });
});
