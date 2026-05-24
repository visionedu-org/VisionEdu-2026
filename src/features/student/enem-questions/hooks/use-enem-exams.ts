"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api-client";
import { enemQuestionsService } from "@/services/enem-questions.service";
import type { EnemExam } from "@/types/enem";

export function useEnemExams() {
  const [exams, setExams] = useState<EnemExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await enemQuestionsService.listExams();
      setExams(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar as provas."
      );
      setExams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carregamento inicial via API
    void load();
  }, [load]);

  return { exams, loading, error, retry: load };
}
