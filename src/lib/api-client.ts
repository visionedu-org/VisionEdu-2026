import type { ApiFieldErrors } from "@/types/domain";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

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

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const fieldErrors =
      typeof data === "object" && data !== null && "errors" in data
        ? (data.errors as ApiFieldErrors)
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
    const response = await fetch(`${API_BASE}${url}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    return parseResponse<T>(response);
  },

  async post<T>(url: string, body: unknown, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${url}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      ...options,
    });
    return parseResponse<T>(response);
  },
};
