import { describe, expect, it } from "vitest";
import { diagnosticFormSchema } from "./teacher";

describe("teacher validations", () => {
  it("rejects question without bnccCode", () => {
    const result = diagnosticFormSchema.safeParse({
      title: "Diagnóstico de revisão",
      grade: "2",
      class_identifier: "A",
      questions: [
        {
          prompt: "Qual é o valor de x?",
          options: ["1", "2", "3", "4"],
          bnccCode: "",
          correctOptionIndex: 0,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid diagnostic with BNCC tags", () => {
    const result = diagnosticFormSchema.safeParse({
      title: "Diagnóstico de revisão",
      grade: "2",
      class_identifier: "A",
      questions: [
        {
          prompt: "Qual é o valor de x?",
          options: ["1", "2", "3", "4"],
          bnccCode: "EM13MAT302",
          correctOptionIndex: 1,
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});
