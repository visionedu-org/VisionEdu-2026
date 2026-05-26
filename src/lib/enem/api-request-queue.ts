import { ApiError } from "@/lib/api-client";
import {
  ENEM_API_429_BASE_DELAY_MS,
  ENEM_API_429_MAX_RETRIES,
  ENEM_API_CACHE_TTL_MS,
  ENEM_API_MIN_REQUEST_INTERVAL_MS,
} from "@/lib/enem/constants";
import type { EnemQuestion, EnemQuestionsResponse } from "@/types/enem";

type QueueTask<T> = () => Promise<T>;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

function listQuestionsCacheKey(
  year: number,
  limit: number,
  offset: number,
  language?: string
): string {
  return `list:${year}:${limit}:${offset}:${language ?? ""}`;
}

function questionCacheKey(
  year: number,
  index: number,
  language?: string
): string {
  return `question:${year}:${index}:${language ?? ""}`;
}

class EnemApiRequestQueue {
  private pending: Array<{
    task: QueueTask<unknown>;
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
  }> = [];

  private draining = false;

  private lastRequestFinishedAt = 0;

  private listCache = new Map<string, CacheEntry<EnemQuestionsResponse>>();

  private questionCache = new Map<string, CacheEntry<EnemQuestion>>();

  enqueue<T>(task: QueueTask<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.pending.push({
        task: task as QueueTask<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
      });
      void this.drain();
    });
  }

  getCachedList(
    year: number,
    limit: number,
    offset: number,
    language?: string
  ): EnemQuestionsResponse | null {
    return this.readCache(
      this.listCache,
      listQuestionsCacheKey(year, limit, offset, language)
    );
  }

  setCachedList(
    year: number,
    limit: number,
    offset: number,
    language: string | undefined,
    value: EnemQuestionsResponse
  ): void {
    this.writeCache(
      this.listCache,
      listQuestionsCacheKey(year, limit, offset, language),
      value
    );
  }

  getCachedQuestion(
    year: number,
    index: number,
    language?: string
  ): EnemQuestion | null {
    return this.readCache(
      this.questionCache,
      questionCacheKey(year, index, language)
    );
  }

  setCachedQuestion(
    year: number,
    index: number,
    language: string | undefined,
    value: EnemQuestion
  ): void {
    this.writeCache(
      this.questionCache,
      questionCacheKey(year, index, language),
      value
    );
  }

  clearCache(): void {
    this.listCache.clear();
    this.questionCache.clear();
  }

  private readCache<T>(store: Map<string, CacheEntry<T>>, key: string): T | null {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }
    return entry.value;
  }

  private writeCache<T>(
    store: Map<string, CacheEntry<T>>,
    key: string,
    value: T
  ): void {
    store.set(key, {
      value,
      expiresAt: Date.now() + ENEM_API_CACHE_TTL_MS,
    });
  }

  private async drain(): Promise<void> {
    if (this.draining) return;
    this.draining = true;

    while (this.pending.length > 0) {
      const elapsed = Date.now() - this.lastRequestFinishedAt;
      const waitMs = Math.max(
        0,
        ENEM_API_MIN_REQUEST_INTERVAL_MS - elapsed
      );
      if (waitMs > 0) {
        await sleep(waitMs);
      }

      const item = this.pending.shift();
      if (!item) break;

      try {
        const result = await this.runWithRateLimitRetry(item.task);
        this.lastRequestFinishedAt = Date.now();
        item.resolve(result);
      } catch (error) {
        this.lastRequestFinishedAt = Date.now();
        item.reject(error);
      }
    }

    this.draining = false;
  }

  private async runWithRateLimitRetry<T>(task: QueueTask<T>): Promise<T> {
    let attempt = 0;

    while (true) {
      try {
        return await task();
      } catch (error) {
        const isRateLimit =
          error instanceof ApiError && error.status === 429;
        if (!isRateLimit || attempt >= ENEM_API_429_MAX_RETRIES) {
          throw error;
        }
        const delayMs = ENEM_API_429_BASE_DELAY_MS * 2 ** attempt;
        attempt += 1;
        await sleep(delayMs);
      }
    }
  }
}

export const enemApiRequestQueue = new EnemApiRequestQueue();

export function isEnemRateLimitError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 429;
}
