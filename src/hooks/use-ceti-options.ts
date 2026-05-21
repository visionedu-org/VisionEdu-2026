"use client";

import { useMemo } from "react";
import { cetiClasses, cetiSchool } from "@/mocks/data/ceti-seed";

const GRADES = ["1", "2", "3"] as const;

export function useCetiOptions() {
  const schools = useMemo(() => [cetiSchool], []);

  const getClasses = (schoolId: string, grade: string) =>
    cetiClasses.filter(
      (c) => c.school_id === schoolId && c.grade === grade
    );

  return {
    schools,
    grades: GRADES,
    getClasses,
    defaultSchoolId: cetiSchool.id,
  };
}
