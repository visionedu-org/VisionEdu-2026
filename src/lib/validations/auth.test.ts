import { describe, expect, it } from "vitest";
import { loginSchema, registerStudentSchema } from "./auth";

describe("auth validations", () => {
  it("rejects short password on login", () => {
    const result = loginSchema.safeParse({
      email: "a@b.co",
      password: "short",
      role: "student",
    });
    expect(result.success).toBe(false);
  });

  it("rejects terms not accepted on student register", () => {
    const result = registerStudentSchema.safeParse({
      name: "Maria Silva",
      email: "maria@escola.pi.gov.br",
      password: "senhaSegura123",
      city: "Vila Nova do Piauí",
      school_id: "d3b07384-d113-4956-a5cc-9c6f2c3d526e",
      grade: "2",
      class_identifier: "A",
      termsAccepted: false,
    });
    expect(result.success).toBe(false);
  });
});
