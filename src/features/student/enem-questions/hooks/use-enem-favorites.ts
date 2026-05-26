"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { loadFavoriteQuestions } from "@/lib/enem/load-favorite-questions";
import { questionKeyFromQuestion } from "@/lib/enem/question-key";
import { shuffleArray } from "@/lib/enem/shuffle-array";
import { getEnemProgress, subscribeEnemProgressLocal } from "@/lib/enem/storage";
import { resolveEnemFetchErrorMessage } from "@/lib/enem/enem-question-api";
import type { EnemQuestion, EnemQuestionFilters } from "@/types/enem";

interface UseEnemFavoritesOptions {
  shuffle?: boolean;
}

export function useEnemFavorites({ shuffle = false }: UseEnemFavoritesOptions = {}) {
  const [questions, setQuestions] = useState<EnemQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [progressTick, setProgressTick] = useState(0);
  const [appliedFilters, setAppliedFilters] =
    useState<Pick<EnemQuestionFilters, "discipline" | "difficulty"> | null>(
      null
    );

  useEffect(() => subscribeEnemProgressLocal(() => setProgressTick((t) => t + 1)), []);

  const favoriteCount = useMemo(() => {
    void progressTick;
    return getEnemProgress().favorites.length;
  }, [progressTick]);

  const syncedQuestions = useMemo(() => {
    void progressTick;
    const keys = new Set(getEnemProgress().favorites);
    return questions.filter((q) => keys.has(questionKeyFromQuestion(q)));
  }, [questions, progressTick]);

  const load = useCallback(
    async (
      filters?: Pick<EnemQuestionFilters, "discipline" | "difficulty">
    ) => {
      setLoading(true);
      setError(null);
      setAppliedFilters(filters ?? null);

      try {
        const keys = getEnemProgress().favorites;
        if (keys.length === 0) {
          setQuestions([]);
          setHasLoaded(true);
          return;
        }

        const loaded = await loadFavoriteQuestions(keys, {
          discipline: filters?.discipline,
          difficulty: filters?.difficulty,
          answered: "all",
        });

        setShuffleSeed(Date.now());
        setQuestions(loaded);
        setHasLoaded(true);
      } catch (err) {
        setError(resolveEnemFetchErrorMessage(err));
        setQuestions([]);
        setHasLoaded(true);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const displayedQuestions = useMemo(() => {
    if (!shuffle) return syncedQuestions;
    return shuffleArray(syncedQuestions, shuffleSeed);
  }, [syncedQuestions, shuffle, shuffleSeed]);

  const retry = useCallback(() => {
    void load(appliedFilters ?? undefined);
  }, [appliedFilters, load]);

  return {
    questions: displayedQuestions,
    favoriteCount,
    loading,
    error,
    hasLoaded,
    load,
    retry,
  };
}
