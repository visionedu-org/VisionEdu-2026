"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { subscribeEnemProgressLocal, getEnemProgress } from "@/lib/enem/storage";
import { applyClientQuestionFilters } from "@/lib/enem/filter-questions";
import {
  hasActiveClientFilters,
  isAllYearsMode,
  isFavoritesOnlyMode,
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
} from "@/lib/enem/constants";
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
  examYears?: number[];
}

export function useEnemQuestions({
  pageSize: rawPageSize = DEFAULT_QUESTIONS_PAGE_SIZE,
  examYears = [],
}: UseEnemQuestionsOptions = {}) {
  const pageSize = clampQuestionsPageSize(rawPageSize);
  const fetchPageSizeRef = useRef(pageSize);

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
            shuffle: appliedFilters.shuffle,
            pageSize,
          })
        : null,
    [appliedFilters, pageSize]
  );

  useEffect(() => subscribeEnemProgressLocal(() => setProgressTick((t) => t + 1)), []);

  const fetchFavorites = useCallback(
    async (filters: EnemQuestionFilters) => {
      setLoading(true);
      setError(null);
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
        setError(
          err instanceof ApiError
            ? err.message
            : "Não foi possível carregar questões favoritas."
        );
        setRawQuestions([]);
        setMetadata(null);
      } finally {
        setLoading(false);
      }
    },
    []
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

      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

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
    []
  );

  const fetchPage = useCallback(
    async (
      offset: number,
      append: boolean,
      queryFilters: EnemQuestionFilters
    ) => {
      if (typeof queryFilters.year !== "number") return;

      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      try {
        const response = await enemQuestionsService.listQuestions({
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
    []
  );

  const apply = useCallback(
    async (
      filters: EnemQuestionFilters,
      options?: { pageSize?: number }
    ) => {
      if (options?.pageSize !== undefined) {
        fetchPageSizeRef.current = clampQuestionsPageSize(options.pageSize);
      }
      setAppliedFilters(filters);
      offsetRef.current = 0;
      allYearsBatchRef.current = createCollectQuestionsBatchState(examYears);
      setAutoPagesLoaded(0);
      setRawQuestions([]);
      setMetadata(null);
      setShuffleSeed(Date.now());

      if (isFavoritesOnlyMode(filters)) {
        await fetchFavorites(filters);
        return;
      }

      if (isAllYearsMode(filters)) {
        await fetchAllYearsPage(examYears, false, filters);
        return;
      }

      await fetchPage(0, false, filters);
    },
    [examYears, fetchAllYearsPage, fetchFavorites, fetchPage]
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
    !favoritesMode &&
    hasActiveClientFilters(appliedFilters) &&
    filteredQuestions.length < MIN_FILTERED_RESULTS &&
    hasMoreFromApi &&
    autoPagesLoaded < MAX_AUTO_PAGES &&
    !loading &&
    !loadingMore;

  useEffect(() => {
    if (!shouldAutoLoadMore || !appliedFilters) return;
    if (allYearsMode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- paginação automática
      void fetchAllYearsPage(examYears, true, appliedFilters);
      return;
    }
    void fetchPage(offsetRef.current, true, appliedFilters);
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
      !hasMoreFromApi ||
      favoritesMode
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
  ]);

  const retry = useCallback(() => {
    if (!appliedFilters) return;
    offsetRef.current = 0;
    allYearsBatchRef.current = createCollectQuestionsBatchState(examYears);
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
    void fetchPage(0, false, appliedFilters);
  }, [appliedFilters, examYears, fetchAllYearsPage, fetchFavorites, fetchPage]);

  return {
    questions,
    loading,
    loadingMore: loadingMore || shouldAutoLoadMore,
    error,
    hasApplied,
    hasMoreFromApi: favoritesMode ? false : hasMoreFromApi,
    apply,
    loadMore,
    retry,
  };
}
