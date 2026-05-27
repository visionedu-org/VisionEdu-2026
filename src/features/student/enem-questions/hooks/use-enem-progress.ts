"use client";

import { useCallback, useEffect, useState } from "react";
import {
  applyEnemAnswerRecord,
  computeEnemStats,
  getEnemAnswer,
  hydrateEnemProgress,
  isEnemFavorite,
  isEnemProgressHydrated,
  isEnemReview,
  notifyEnemProgressChange,
  recordEnemAnswer,
  setEnemFavorite,
  subscribeEnemProgressLocal,
  toggleEnemReview,
} from "@/lib/enem/storage";
import { migrateLegacyEnemProgressToServer } from "@/lib/enem/migrate-local-progress";
import { enemQuestionsService } from "@/services/enem-questions.service";
import { questionKeyFromQuestion } from "@/lib/enem/question-key";
import type {
  EnemProgressStats,
  EnemQuestion,
  EnemQuestionAnswerRecord,
} from "@/types/enem";
import type { EnemAlternativeLetter } from "@/types/enem";

const EMPTY_STATS: EnemProgressStats = {
  totalAnswered: 0,
  totalCorrect: 0,
  totalIncorrect: 0,
  accuracyPercent: 0,
  byDiscipline: {},
  recentAnswers: [],
  dailyCorrect: [],
};

export function useEnemProgress() {
  const [stats, setStats] = useState<EnemProgressStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(() => isEnemProgressHydrated());

  const refresh = useCallback(() => {
    setStats(computeEnemStats());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        await migrateLegacyEnemProgressToServer();
        const payload = await enemQuestionsService.getProgress();
        if (cancelled) return;
        hydrateEnemProgress(payload.progress);
        setStats(payload.stats);
        setHydrated(true);
        notifyEnemProgressChange();
      } catch {
        if (!cancelled) {
          setStats(computeEnemStats());
          setHydrated(isEnemProgressHydrated());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return subscribeEnemProgressLocal(() => setStats(computeEnemStats()));
  }, []);

  const answerQuestion = useCallback(
    (question: EnemQuestion, letter: EnemAlternativeLetter) => {
      const record = recordEnemAnswer(question, letter);
      notifyEnemProgressChange();
      void enemQuestionsService
        .recordAttempt({
          year: question.year,
          index: question.index,
          language: question.language,
          selectedLetter: letter,
        })
        .then((result) => {
          applyEnemAnswerRecord({
            ...record,
            isCorrect: result.isCorrect,
            questionKey: result.questionKey,
          });
          notifyEnemProgressChange();
        })
        .catch(() => undefined);
      return record;
    },
    []
  );

  const toggleFavorite = useCallback((question: EnemQuestion) => {
    const key = questionKeyFromQuestion(question);
    const wasFavorite = isEnemFavorite(key);
    setEnemFavorite(key, !wasFavorite);
    notifyEnemProgressChange();

    void enemQuestionsService
      .toggleFavorite({
        year: question.year,
        index: question.index,
        language: question.language,
      })
      .then(({ isFavorite }) => {
        setEnemFavorite(key, isFavorite);
        notifyEnemProgressChange();
      })
      .catch(() => {
        setEnemFavorite(key, wasFavorite);
        notifyEnemProgressChange();
      });

    return !wasFavorite;
  }, []);

  const toggleReview = useCallback((question: EnemQuestion) => {
    const key = questionKeyFromQuestion(question);
    const isRev = toggleEnemReview(key);
    notifyEnemProgressChange();
    return isRev;
  }, []);

  const getAnswer = useCallback(
    (question: EnemQuestion): EnemQuestionAnswerRecord | undefined => {
      return getEnemAnswer(questionKeyFromQuestion(question));
    },
    []
  );

  const checkFavorite = useCallback((question: EnemQuestion) => {
    return isEnemFavorite(questionKeyFromQuestion(question));
  }, []);

  const checkReview = useCallback((question: EnemQuestion) => {
    return isEnemReview(questionKeyFromQuestion(question));
  }, []);

  return {
    stats,
    loading,
    hydrated,
    answerQuestion,
    toggleFavorite,
    toggleReview,
    getAnswer,
    checkFavorite,
    checkReview,
    refresh,
  };
}
