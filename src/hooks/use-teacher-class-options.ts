"use client";

import { useEffect, useMemo, useState } from "react";
import type { ClassGroup } from "@/types/domain";
import { teacherService } from "@/services/teacher.service";
import { ApiError } from "@/lib/api-client";

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

  const grades = useMemo(
    () => [...new Set(assignedClasses.map((c) => c.grade))].sort(),
    [assignedClasses]
  );

  return { assignedClasses, grades, loading, error };
}
