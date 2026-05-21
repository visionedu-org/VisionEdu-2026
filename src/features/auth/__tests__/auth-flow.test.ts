import { describe, expect, it } from "vitest";
import { authService } from "@/services/auth.service";
import {
  DEMO_STUDENT_EMAIL,
  DEMO_STUDENT_PASSWORD,
} from "@/mocks/data/ceti-seed";

describe("auth MSW flows", () => {
  it("login student demo returns access_token", async () => {
    const res = await authService.login(
      DEMO_STUDENT_EMAIL,
      DEMO_STUDENT_PASSWORD,
      "student"
    );
    expect(res.access_token).toBeDefined();
    expect(res.expires_in).toBe(28800);
    expect(res.user.role).toBe("student");
  });

  it("login wrong password throws", async () => {
    await expect(
      authService.login(DEMO_STUDENT_EMAIL, "wrong-password", "student")
    ).rejects.toThrow();
  });

  it("register student returns 201 token", async () => {
    const email = `novo.aluno.${Date.now()}@escola.pi.gov.br`;
    const res = await authService.registerStudent({
      name: "Maria Teste",
      email,
      password: "senhaSegura123",
      school_id: "d3b07384-d113-4956-a5cc-9c6f2c3d526e",
      grade: "1",
      class_identifier: "A",
      termsAccepted: true,
    });
    expect(res.access_token).toBeDefined();
    expect(res.user.email).toBe(email);
  });

  it("register teacher with two classes", async () => {
    const email = `novo.prof.${Date.now()}@escola.pi.gov.br`;
    const res = await authService.registerTeacher({
      name: "Regina Teste",
      email,
      password: "senhaSegura123",
      classes: [
        {
          school_id: "d3b07384-d113-4956-a5cc-9c6f2c3d526e",
          grade: "2",
          class_identifier: "A",
        },
        {
          school_id: "d3b07384-d113-4956-a5cc-9c6f2c3d526e",
          grade: "3",
          class_identifier: "B",
        },
      ],
      termsAccepted: true,
    });
    expect(res.user.teacher_classes?.length).toBe(2);
  });
});
