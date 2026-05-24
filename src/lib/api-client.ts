import { getApiErrorMessage } from "@/lib/api-error-messages";
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

function extractApiErrorPayload(data: unknown): {
  code?: string;
  message?: string;
  fieldErrors?: ApiFieldErrors;
} {
  if (typeof data !== "object" || data === null) {
    return {};
  }
  const record = data as Record<string, unknown>;
  const code = typeof record.code === "string" ? record.code : undefined;
  const message =
    typeof record.message === "string" ? record.message : undefined;
  const fieldErrors =
    "details" in record && record.details !== undefined
      ? normalizeFieldErrors(
          (record.details as { fieldErrors?: unknown }).fieldErrors
        )
      : "errors" in record
        ? normalizeFieldErrors(record.errors)
        : undefined;
  return { code, message, fieldErrors };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const { code, message: serverMessage, fieldErrors } =
      extractApiErrorPayload(data);
    const message = getApiErrorMessage(
      code,
      response.status,
      serverMessage ?? response.statusText
    );
    throw new ApiError(message, response.status, fieldErrors);
  }
  return data as T;
}

export interface UploadFileResult {
  uploadId: string;
  storageKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export const apiClient = {
  async fetchRaw(url: string, options?: RequestInit): Promise<Response> {
    const { headers: optionHeaders, ...rest } = options ?? {};
    return fetch(`${API_BASE}${url}`, {
      ...rest,
      credentials: "include",
      headers: {
        ...getAuthHeaders(),
        ...optionHeaders,
      },
    });
  },

  uploadFile<T = UploadFileResult>(
    url: string,
    formData: FormData,
    onProgress?: (percent: number) => void
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE}${url}`);
      xhr.withCredentials = true;

      const authHeaders = getAuthHeaders();
      if (authHeaders instanceof Object) {
        for (const [key, value] of Object.entries(authHeaders)) {
          if (typeof value === "string") {
            xhr.setRequestHeader(key, value);
          }
        }
      }

      xhr.upload.onprogress = (event) => {
        if (!onProgress || !event.lengthComputable) return;
        onProgress(Math.round((event.loaded / event.total) * 100));
      };

      xhr.onerror = () => {
        reject(new ApiError("Falha de rede ao enviar o arquivo.", 0));
      };

      xhr.onabort = () => {
        reject(new ApiError("Envio do arquivo cancelado.", 0));
      };

      xhr.onload = () => {
        let data: unknown = {};
        try {
          data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
        } catch {
          data = {};
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data as T);
          return;
        }

        const { code, message: serverMessage } = extractApiErrorPayload(data);
        const message = getApiErrorMessage(
          code,
          xhr.status,
          serverMessage ?? "Erro ao enviar o arquivo"
        );
        reject(new ApiError(message, xhr.status));
      };

      xhr.send(formData);
    });
  },

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

  async patch<T>(url: string, options?: RequestInit): Promise<T> {
    const { headers: optionHeaders, ...rest } = options ?? {};
    const response = await fetch(`${API_BASE}${url}`, {
      ...rest,
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...optionHeaders,
      },
    });
    return parseResponse<T>(response);
  },

  async delete<T>(url: string, options?: RequestInit): Promise<T> {
    const { headers: optionHeaders, ...rest } = options ?? {};
    const response = await fetch(`${API_BASE}${url}`, {
      ...rest,
      method: "DELETE",
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
