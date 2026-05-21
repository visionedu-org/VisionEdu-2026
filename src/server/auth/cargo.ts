import type { Cargo } from "@prisma/client";
import type { UserRole } from "@/types/domain";

export function cargoToRole(cargo: Cargo): UserRole {
  switch (cargo) {
    case "estudante":
      return "student";
    case "professor":
      return "teacher";
    default:
      return "student";
  }
}

export function roleToCargo(role: UserRole): Cargo {
  switch (role) {
    case "student":
      return "estudante";
    case "teacher":
      return "professor";
    default:
      return "estudante";
  }
}
