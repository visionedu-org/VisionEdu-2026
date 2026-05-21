import { describe, expect, it } from "vitest";
import { cargoToRole, roleToCargo } from "../cargo";

describe("cargo mapping", () => {
  it("maps estudante to student", () => {
    expect(cargoToRole("estudante")).toBe("student");
    expect(roleToCargo("student")).toBe("estudante");
  });

  it("maps professor to teacher", () => {
    expect(cargoToRole("professor")).toBe("teacher");
    expect(roleToCargo("teacher")).toBe("professor");
  });
});
