import { authHandlers } from "./auth";
import { healthHandlers } from "./health";
import { schoolsHandlers } from "./schools";
import { studentHandlers } from "./students";
import { teacherHandlers } from "./teachers";

export const handlers = [
  ...healthHandlers,
  ...authHandlers,
  ...schoolsHandlers,
  ...studentHandlers,
  ...teacherHandlers,
];
