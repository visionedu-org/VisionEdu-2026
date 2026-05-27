"use client";

import { useMemo } from "react";
import type { ActivityCity } from "@/lib/constants/activity-cities";
import { getSchoolsForActivityCity } from "@/lib/constants/schools-by-city";
import { pilotClasses, pilotSchools } from "@/mocks/data/ceti-seed";

const GRADES = ["1", "2", "3"] as const;

export function useCetiOptions(activityCity?: ActivityCity) {
  const schools = useMemo(
    () =>
      activityCity ? getSchoolsForActivityCity(activityCity) : pilotSchools,
    [activityCity]
  );

  const getClasses = (schoolId: string, grade: string) =>
    pilotClasses.filter(
      (c) => c.school_id === schoolId && c.grade === grade
    );

  const defaultSchoolId = schools[0]?.id ?? pilotSchools[0]!.id;

  return {
    schools,
    grades: GRADES,
    getClasses,
    defaultSchoolId,
  };
}
