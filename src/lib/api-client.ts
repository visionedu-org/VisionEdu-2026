import type { ApiFieldErrors } from "@/types/domain";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("visionedu-auth");
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { state?: { accessToken?: string } };
    const token = parsed?.state?.accessToken;
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}

export class ApiError extends Error {
  status: number;
  fieldErrors?: ApiFieldErrors;

  constructor(message: string, status: number, fieldErrors?: ApiFieldErrors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

function normalizeFieldErrors(raw: unknown): ApiFieldErrors | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const result: ApiFieldErrors = {};
  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value) && value[0]) {
      result[key] = String(value[0]);
    } else if (typeof value === "string") {
      result[key] = value;
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const fieldErrors =
      typeof data === "object" && data !== null && "errors" in data
        ? normalizeFieldErrors((data as { errors: unknown }).errors)
        : undefined;
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message: string }).message)
        : response.statusText || "Erro na requisição";
    throw new ApiError(message, response.status, fieldErrors);
  }
  return data as T;
}

export const apiClient = {
  async get<T>(url: string, options?: RequestInit): Promise<T> {
    const { headers: optionHeaders, ...rest } = options ?? {};
    const response = await fetch(`${API_BASE}${url}`, {
      ...rest,
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...optionHeaders,
      },
    });
    return parseResponse<T>(response);
  },

  async post<T>(url: string, body: unknown, options?: RequestInit): Promise<T> {
    const { headers: optionHeaders, ...rest } = options ?? {};
    const response = await fetch(`${API_BASE}${url}`, {
      ...rest,
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...optionHeaders,
      },
      body: JSON.stringify(body),
    });
    return parseResponse<T>(response);
  },
};
