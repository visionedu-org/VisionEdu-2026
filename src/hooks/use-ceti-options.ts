"use client";

import { useMemo } from "react";
import {
  cetiSchool,
  pilotClasses,
  pilotSchools,
} from "@/mocks/data/ceti-seed";

const GRADES = ["1", "2", "3"] as const;

export function useCetiOptions() {
  const schools = useMemo(() => pilotSchools, []);

  const getClasses = (schoolId: string, grade: string) =>
    pilotClasses.filter(
      (c) => c.school_id === schoolId && c.grade === grade
    );

  return {
    schools,
    grades: GRADES,
    getClasses,
    defaultSchoolId: cetiSchool.id,
  };
}
