"use client";

import { useCallback, useEffect, useState } from "react";
import {
  computeEnemStats,
  getEnemAnswer,
  isEnemFavorite,
  isEnemReview,
  notifyEnemProgressChange,
  recordEnemAnswer,
  subscribeEnemProgressLocal,
  toggleEnemFavorite,
  toggleEnemReview,
} from "@/lib/enem/storage";
import { questionKeyFromQuestion } from "@/lib/enem/question-key";
import type {
  EnemProgressStats,
  EnemQuestion,
  EnemQuestionAnswerRecord,
} from "@/types/enem";
import type { EnemAlternativeLetter } from "@/types/enem";

export function useEnemProgress() {
  const [stats, setStats] = useState<EnemProgressStats>(() =>
    typeof window !== "undefined"
      ? computeEnemStats()
      : {
          totalAnswered: 0,
          totalCorrect: 0,
          totalIncorrect: 0,
          accuracyPercent: 0,
          byDiscipline: {},
          recentAnswers: [],
          dailyCorrect: [],
        }
  );

  const refresh = useCallback(() => {
    setStats(computeEnemStats());
  }, []);

  useEffect(() => {
    return subscribeEnemProgressLocal(() => setStats(computeEnemStats()));
  }, []);

  const answerQuestion = useCallback(
    (question: EnemQuestion, letter: EnemAlternativeLetter) => {
      const record = recordEnemAnswer(question, letter);
      notifyEnemProgressChange();
      return record;
    },
    []
  );

  const toggleFavorite = useCallback((question: EnemQuestion) => {
    const key = questionKeyFromQuestion(question);
    const isFav = toggleEnemFavorite(key);
    notifyEnemProgressChange();
    return isFav;
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
    answerQuestion,
    toggleFavorite,
    toggleReview,
    getAnswer,
    checkFavorite,
    checkReview,
    refresh,
  };
}
