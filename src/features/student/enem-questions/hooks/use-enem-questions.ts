"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { subscribeEnemProgressLocal, getEnemProgress } from "@/lib/enem/storage";
import { applyClientQuestionFilters } from "@/lib/enem/filter-questions";
import { listOffsetForDiscipline } from "@/lib/enem/discipline-index-ranges";
import {
  hasActiveClientFilters,
  isAllYearsMode,
  isFavoritesOnlyMode,
  shouldAutoLoadMoreQuestions,
} from "@/lib/enem/filter-state";
import {
  collectQuestionsBatch,
  createCollectQuestionsBatchState,
} from "@/lib/enem/collect-questions-batch";
import { loadFavoriteQuestions } from "@/lib/enem/load-favorite-questions";
import { shuffleArray } from "@/lib/enem/shuffle-array";
import {
  clampQuestionsPageSize,
  DEFAULT_QUESTIONS_PAGE_SIZE,
  ENEM_AUTO_LOAD_DELAY_MS,
  ENEM_MAX_AUTO_PAGES,
} from "@/lib/enem/constants";
import {
  fetchEnemQuestionsList,
  isEnemRateLimitError,
  resolveEnemFetchErrorMessage,
} from "@/lib/enem/enem-question-api";
import type {
  EnemQuestion,
  EnemQuestionFilters,
  EnemQuestionsMetadata,
} from "@/types/enem";

interface UseEnemQuestionsOptions {
  pageSize?: number;
  examYears?: number[];
}

export function useEnemQuestions({
  pageSize: rawPageSize = DEFAULT_QUESTIONS_PAGE_SIZE,
  examYears = [],
}: UseEnemQuestionsOptions = {}) {
  const pageSize = clampQuestionsPageSize(rawPageSize);
  const fetchPageSizeRef = useRef(pageSize);
  const fetchInFlightRef = useRef(false);
  const autoLoadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchPageSizeRef.current = pageSize;
  }, [pageSize]);

  const [appliedFilters, setAppliedFilters] =
    useState<EnemQuestionFilters | null>(null);
  const [rawQuestions, setRawQuestions] = useState<EnemQuestion[]>([]);
  const [metadata, setMetadata] = useState<EnemQuestionsMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [progressTick, setProgressTick] = useState(0);
  const [autoPagesLoaded, setAutoPagesLoaded] = useState(0);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const offsetRef = useRef(0);
  const allYearsBatchRef = useRef(createCollectQuestionsBatchState([]));

  const clientFilterKey = useMemo(
    () =>
      appliedFilters
        ? JSON.stringify({
            year: appliedFilters.year,
            discipline: appliedFilters.discipline,
            difficulty: appliedFilters.difficulty,
            answered: appliedFilters.answered,
            favorites: appliedFilters.favorites,
            pageSize,
          })
        : null,
    [appliedFilters, pageSize]
  );

  useEffect(() => subscribeEnemProgressLocal(() => setProgressTick((t) => t + 1)), []);

  useEffect(() => {
    return () => {
      if (autoLoadTimerRef.current) {
        clearTimeout(autoLoadTimerRef.current);
      }
    };
  }, []);

  const handleFetchError = useCallback((err: unknown, append: boolean) => {
    if (isEnemRateLimitError(err)) {
      setRateLimited(true);
    }
    setError(resolveEnemFetchErrorMessage(err));
    if (!append) {
      setRawQuestions([]);
      setMetadata(null);
    }
  }, []);

  const fetchFavorites = useCallback(
    async (filters: EnemQuestionFilters) => {
      if (fetchInFlightRef.current) return;
      fetchInFlightRef.current = true;
      setLoading(true);
      setError(null);
      setRateLimited(false);
      try {
        const keys = getEnemProgress().favorites;
        const loaded = await loadFavoriteQuestions(keys, {
          discipline: filters.discipline,
          difficulty: filters.difficulty,
          answered:
            filters.answered === "favorites" ? "all" : filters.answered,
        });
        setRawQuestions(loaded);
        setMetadata({
          limit: loaded.length,
          offset: 0,
          total: loaded.length,
          hasMore: false,
        });
        offsetRef.current = loaded.length;
      } catch (err) {
        handleFetchError(err, false);
      } finally {
        setLoading(false);
        fetchInFlightRef.current = false;
      }
    },
    [handleFetchError]
  );

  const fetchAllYearsPage = useCallback(
    async (
      years: number[],
      append: boolean,
      queryFilters: EnemQuestionFilters
    ) => {
      if (years.length === 0) {
        setRawQuestions([]);
        setMetadata(null);
        return;
      }
      if (fetchInFlightRef.current) return;

      fetchInFlightRef.current = true;
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      if (!append) setRateLimited(false);

      try {
        const { questions: batch, hasMore } = await collectQuestionsBatch(
          years,
          fetchPageSizeRef.current,
          queryFilters,
          allYearsBatchRef.current
        );

        offsetRef.current = Object.values(
          allYearsBatchRef.current.offsets
        ).reduce((sum, n) => sum + n, 0);

        setMetadata({
          limit: fetchPageSizeRef.current,
          offset: offsetRef.current,
          total: allYearsBatchRef.current.seenKeys.size,
          hasMore,
        });
        setRawQuestions((prev) =>
          append ? [...prev, ...batch] : batch
        );

        if (append && hasActiveClientFilters(queryFilters)) {
          setAutoPagesLoaded((n) => n + 1);
        }
      } catch (err) {
        handleFetchError(err, append);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        fetchInFlightRef.current = false;
      }
    },
    [handleFetchError]
  );

  const fetchPage = useCallback(
    async (
      offset: number,
      append: boolean,
      queryFilters: EnemQuestionFilters
    ) => {
      if (typeof queryFilters.year !== "number") return;
      if (fetchInFlightRef.current) return;

      fetchInFlightRef.current = true;
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      if (!append) setRateLimited(false);

      try {
        const response = await fetchEnemQuestionsList({
          year: queryFilters.year,
          limit: fetchPageSizeRef.current,
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
        handleFetchError(err, append);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        fetchInFlightRef.current = false;
      }
    },
    [handleFetchError]
  );

  function filtersEqualExceptShuffle(
    a: EnemQuestionFilters,
    b: EnemQuestionFilters
  ): boolean {
    return (
      a.year === b.year &&
      a.discipline === b.discipline &&
      a.difficulty === b.difficulty &&
      a.answered === b.answered &&
      a.favorites === b.favorites &&
      a.language === b.language
    );
  }

  const apply = useCallback(
    async (
      filters: EnemQuestionFilters,
      options?: { pageSize?: number }
    ) => {
      if (options?.pageSize !== undefined) {
        fetchPageSizeRef.current = clampQuestionsPageSize(options.pageSize);
      }
      if (autoLoadTimerRef.current) {
        clearTimeout(autoLoadTimerRef.current);
        autoLoadTimerRef.current = null;
      }

      if (
        appliedFilters &&
        filtersEqualExceptShuffle(appliedFilters, filters) &&
        rawQuestions.length > 0
      ) {
        setAppliedFilters(filters);
        setShuffleSeed(Date.now());
        return;
      }

      setAppliedFilters(filters);
      offsetRef.current = filters.discipline
        ? listOffsetForDiscipline(filters.discipline)
        : 0;
      allYearsBatchRef.current = createCollectQuestionsBatchState(
        examYears,
        filters.discipline || undefined
      );
      setAutoPagesLoaded(0);
      setRawQuestions([]);
      setMetadata(null);
      setRateLimited(false);
      setShuffleSeed(Date.now());

      if (isFavoritesOnlyMode(filters)) {
        await fetchFavorites(filters);
        return;
      }

      if (isAllYearsMode(filters)) {
        await fetchAllYearsPage(examYears, false, filters);
        return;
      }

      await fetchPage(offsetRef.current, false, filters);
    },
    [
      appliedFilters,
      examYears,
      fetchAllYearsPage,
      fetchFavorites,
      fetchPage,
      rawQuestions.length,
    ]
  );

  useEffect(() => {
    if (!clientFilterKey) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reinicia paginação automática
    setAutoPagesLoaded(0);
  }, [clientFilterKey]);

  const filteredQuestions = useMemo(() => {
    if (!appliedFilters) return [];
    return applyClientQuestionFilters(rawQuestions, appliedFilters);
    // progressTick força re-filtro após resposta/favorito local
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawQuestions, appliedFilters, progressTick]);

  const questions = useMemo(() => {
    if (appliedFilters?.shuffle === false) return filteredQuestions;
    return shuffleArray(filteredQuestions, shuffleSeed);
  }, [filteredQuestions, appliedFilters?.shuffle, shuffleSeed]);

  const hasMoreFromApi = metadata?.hasMore ?? false;
  const hasApplied = appliedFilters !== null;
  const favoritesMode = appliedFilters
    ? isFavoritesOnlyMode(appliedFilters)
    : false;
  const allYearsMode = appliedFilters ? isAllYearsMode(appliedFilters) : false;

  const shouldAutoLoadMore =
    hasApplied &&
    appliedFilters &&
    shouldAutoLoadMoreQuestions(appliedFilters, {
      filteredCount: filteredQuestions.length,
      hasMoreFromApi,
      autoPagesLoaded,
      maxAutoPages: ENEM_MAX_AUTO_PAGES,
      loading,
      loadingMore,
      rateLimited,
      favoritesMode,
    });

  useEffect(() => {
    if (!shouldAutoLoadMore || !appliedFilters) return;

    autoLoadTimerRef.current = globalThis.setTimeout(() => {
      if (fetchInFlightRef.current) return;
      if (allYearsMode) {
        void fetchAllYearsPage(examYears, true, appliedFilters);
        return;
      }
      void fetchPage(offsetRef.current, true, appliedFilters);
    }, ENEM_AUTO_LOAD_DELAY_MS);

    return () => {
      if (autoLoadTimerRef.current) {
        clearTimeout(autoLoadTimerRef.current);
        autoLoadTimerRef.current = null;
      }
    };
  }, [
    allYearsMode,
    appliedFilters,
    clientFilterKey,
    examYears,
    fetchAllYearsPage,
    fetchPage,
    shouldAutoLoadMore,
  ]);

  const loadMore = useCallback(() => {
    if (
      !appliedFilters ||
      loadingMore ||
      loading ||
      fetchInFlightRef.current ||
      !hasMoreFromApi ||
      favoritesMode ||
      rateLimited
    ) {
      return;
    }
    if (allYearsMode) {
      void fetchAllYearsPage(examYears, true, appliedFilters);
      return;
    }
    void fetchPage(offsetRef.current, true, appliedFilters);
  }, [
    allYearsMode,
    appliedFilters,
    examYears,
    fetchAllYearsPage,
    fetchPage,
    favoritesMode,
    hasMoreFromApi,
    loading,
    loadingMore,
    rateLimited,
  ]);

  const retry = useCallback(() => {
    if (!appliedFilters) return;
    setRateLimited(false);
    offsetRef.current = appliedFilters.discipline
      ? listOffsetForDiscipline(appliedFilters.discipline)
      : 0;
    allYearsBatchRef.current = createCollectQuestionsBatchState(
      examYears,
      appliedFilters.discipline || undefined
    );
    setAutoPagesLoaded(0);
    setShuffleSeed(Date.now());
    if (isFavoritesOnlyMode(appliedFilters)) {
      void fetchFavorites(appliedFilters);
      return;
    }
    if (isAllYearsMode(appliedFilters)) {
      void fetchAllYearsPage(examYears, false, appliedFilters);
      return;
    }
    void fetchPage(offsetRef.current, false, appliedFilters);
  }, [appliedFilters, examYears, fetchAllYearsPage, fetchFavorites, fetchPage]);

  const reshuffle = useCallback(() => {
    setShuffleSeed(Date.now());
  }, []);

  return {
    questions,
    loading,
    loadingMore: loadingMore || shouldAutoLoadMore,
    error,
    rateLimited,
    hasApplied,
    hasMoreFromApi: favoritesMode ? false : hasMoreFromApi,
    apply,
    loadMore,
    retry,
    reshuffle,
  };
}
