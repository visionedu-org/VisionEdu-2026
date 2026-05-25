"use client";

import { useEffect, useMemo, useState } from "react";
import type { ClassGroup, School } from "@/types/domain";
import { pilotSchools } from "@/mocks/data/ceti-seed";
import { teacherService } from "@/services/teacher.service";
import { ApiError } from "@/lib/api-client";

function resolveAssignedSchools(classes: ClassGroup[]): School[] {
  const schoolIds = [...new Set(classes.map((entry) => entry.school_id))];
  return schoolIds.map((schoolId) => {
    const known = pilotSchools.find((school) => school.id === schoolId);
    return known ?? { id: schoolId, name: "Escola vinculada" };
  });
}

export function useTeacherClassOptions() {
  const [assignedClasses, setAssignedClasses] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { classes } = await teacherService.listMyClasses();
        if (!cancelled) setAssignedClasses(classes);
      } catch (err) {
        if (!cancelled) {
          setAssignedClasses([]);
          setError(
            err instanceof ApiError
              ? err.message
              : "Não foi possível carregar suas turmas."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const schools = useMemo(
    () => resolveAssignedSchools(assignedClasses),
    [assignedClasses]
  );

  const grades = useMemo(
    () => [...new Set(assignedClasses.map((c) => c.grade))].sort(),
    [assignedClasses]
  );

  return { assignedClasses, schools, grades, loading, error };
}
