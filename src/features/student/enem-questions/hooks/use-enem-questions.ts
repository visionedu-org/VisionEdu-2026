"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { subscribeEnemProgressLocal } from "@/lib/enem/storage";
import { applyClientQuestionFilters } from "@/lib/enem/filter-questions";
import { hasActiveClientFilters } from "@/lib/enem/filter-state";
import { DEFAULT_QUESTIONS_PAGE_SIZE } from "@/lib/enem/constants";
import { ApiError } from "@/lib/api-client";
import { enemQuestionsService } from "@/services/enem-questions.service";
import type {
  EnemQuestion,
  EnemQuestionFilters,
  EnemQuestionsMetadata,
} from "@/types/enem";

const MIN_FILTERED_RESULTS = 8;
const MAX_AUTO_PAGES = 12;

interface UseEnemQuestionsOptions {
  pageSize?: number;
}

export function useEnemQuestions({
  pageSize = DEFAULT_QUESTIONS_PAGE_SIZE,
}: UseEnemQuestionsOptions = {}) {
  const [appliedFilters, setAppliedFilters] =
    useState<EnemQuestionFilters | null>(null);
  const [rawQuestions, setRawQuestions] = useState<EnemQuestion[]>([]);
  const [metadata, setMetadata] = useState<EnemQuestionsMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressTick, setProgressTick] = useState(0);
  const [autoPagesLoaded, setAutoPagesLoaded] = useState(0);
  const offsetRef = useRef(0);

  const clientFilterKey = useMemo(
    () =>
      appliedFilters
        ? JSON.stringify({
            discipline: appliedFilters.discipline,
            difficulty: appliedFilters.difficulty,
            answered: appliedFilters.answered,
          })
        : null,
    [appliedFilters]
  );

  useEffect(() => subscribeEnemProgressLocal(() => setProgressTick((t) => t + 1)), []);

  const fetchPage = useCallback(
    async (
      offset: number,
      append: boolean,
      queryFilters: EnemQuestionFilters
    ) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      try {
        const response = await enemQuestionsService.listQuestions({
          year: queryFilters.year,
          limit: pageSize,
          offset,
          language: queryFilters.language || undefined,
        });

        offsetRef.current = offset + response.questions.length;
        setMetadata(response.metadata);
        setRawQuestions((prev) =>
          append ? [...prev, ...response.questions] : response.questions
        );

        if (append && hasActiveClientFilters(queryFilters)) {
          setAutoPagesLoaded((n) => n + 1);
        }
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : "Não foi possível carregar as questões."
        );
        if (!append) {
          setRawQuestions([]);
          setMetadata(null);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [pageSize]
  );

  const apply = useCallback(
    async (filters: EnemQuestionFilters) => {
      setAppliedFilters(filters);
      offsetRef.current = 0;
      setAutoPagesLoaded(0);
      setRawQuestions([]);
      setMetadata(null);
      await fetchPage(0, false, filters);
    },
    [fetchPage]
  );

  useEffect(() => {
    if (!clientFilterKey) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reinicia paginação automática
    setAutoPagesLoaded(0);
  }, [clientFilterKey]);

  const filteredQuestions = useMemo(
    () => {
      if (!appliedFilters) return [];
      return applyClientQuestionFilters(rawQuestions, appliedFilters);
    },
    // progressTick força re-filtro após resposta/favorito local
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rawQuestions, appliedFilters, progressTick]
  );

  const hasMoreFromApi = metadata?.hasMore ?? false;
  const hasApplied = appliedFilters !== null;

  const shouldAutoLoadMore =
    hasApplied &&
    appliedFilters &&
    hasActiveClientFilters(appliedFilters) &&
    filteredQuestions.length < MIN_FILTERED_RESULTS &&
    hasMoreFromApi &&
    autoPagesLoaded < MAX_AUTO_PAGES &&
    !loading &&
    !loadingMore;

  useEffect(() => {
    if (!shouldAutoLoadMore || !appliedFilters) return;
    void fetchPage(offsetRef.current, true, appliedFilters);
  }, [shouldAutoLoadMore, clientFilterKey, fetchPage, appliedFilters]);

  const loadMore = useCallback(() => {
    if (!appliedFilters || loadingMore || loading || !hasMoreFromApi) return;
    void fetchPage(offsetRef.current, true, appliedFilters);
  }, [appliedFilters, fetchPage, hasMoreFromApi, loading, loadingMore]);

  const retry = useCallback(() => {
    if (!appliedFilters) return;
    offsetRef.current = 0;
    setAutoPagesLoaded(0);
    void fetchPage(0, false, appliedFilters);
  }, [appliedFilters, fetchPage]);

  return {
    questions: filteredQuestions,
    loading,
    loadingMore: loadingMore || shouldAutoLoadMore,
    error,
    hasApplied,
    hasMoreFromApi,
    apply,
    loadMore,
    retry,
  };
}
