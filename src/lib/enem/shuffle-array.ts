/** Gerador pseudoaleatório determinístico (LCG) para ordem estável entre re-renders. */
function createSeededRandom(seed: number): () => number {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

/** Embaralha cópia do array (Fisher–Yates). Com seed, a ordem permanece até novo apply. */
export function shuffleArray<T>(items: T[], seed?: number): T[] {
  const result = [...items];
  const random =
    seed !== undefined ? createSeededRandom(seed) : () => Math.random();

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
