import { http, HttpResponse } from "msw";
import { cetiClasses, cetiSchool } from "@/mocks/data/ceti-seed";

export const schoolsHandlers = [
  http.get("/api/v1/schools", () => {
    return HttpResponse.json({
      schools: [cetiSchool],
      classes: cetiClasses,
    });
  }),
];
