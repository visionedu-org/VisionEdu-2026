import { authHandlers } from "./auth";
import { healthHandlers } from "./health";
import { schoolsHandlers } from "./schools";
import { studentHandlers } from "./students";
import { teacherHandlers } from "./teachers";

/** MSW de auth só quando mock ativo ou em testes (Vitest). */
const useAuthMock =
  process.env.NEXT_PUBLIC_USE_MOCK === "true" ||
  process.env.VITEST === "true";

export const handlers = [
  ...healthHandlers,
  ...(useAuthMock ? authHandlers : []),
  ...schoolsHandlers,
  ...studentHandlers,
  ...teacherHandlers,
];
