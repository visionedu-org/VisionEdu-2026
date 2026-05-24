const ENEM_API_BASE =
  process.env.ENEM_API_BASE_URL ?? "https://api.enem.dev/v1";

export class EnemApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = "EnemApiError";
  }
}

interface EnemErrorBody {
  error?: {
    code?: string;
    message?: string;
  };
}

export async function fetchEnemApi<T>(
  path: string,
  options?: { revalidate?: number; cache?: RequestCache }
): Promise<T> {
  const url = `${ENEM_API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: options?.cache,
    next:
      options?.revalidate !== undefined
        ? { revalidate: options.revalidate }
        : undefined,
  });

  if (!response.ok) {
    let code: string | undefined;
    let message = `Erro na API ENEM (${response.status})`;
    try {
      const body = (await response.json()) as EnemErrorBody;
      code = body.error?.code;
      message = body.error?.message ?? message;
    } catch {
      /* ignore */
    }
    throw new EnemApiError(message, response.status, code);
  }

  return response.json() as Promise<T>;
}
