import { N8nConfigError, N8nRequestError } from "@/server/n8n/n8n-errors";

const DEFAULT_TIMEOUT_MS = 90_000;

export async function requestN8nWebhook<TResponse>(
  envVarName: string,
  payload: unknown,
  parseResponse: (data: unknown) => TResponse
): Promise<TResponse> {
  const url = process.env[envVarName]?.trim();
  if (!url) {
    throw new N8nConfigError(`${envVarName} não está configurada.`);
  }

  const secret = process.env.N8N_WEBHOOK_SECRET?.trim();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (secret) {
    headers["X-Webhook-Secret"] = secret;
  }

  const timeoutMs = Number.parseInt(
    process.env.N8N_WEBHOOK_TIMEOUT_MS ?? "",
    10
  );
  const ms =
    Number.isFinite(timeoutMs) && timeoutMs > 0
      ? timeoutMs
      : DEFAULT_TIMEOUT_MS;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: "no-store",
    });

    const data: unknown = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        typeof data === "object" &&
        data !== null &&
        typeof (data as { message?: string }).message === "string"
          ? (data as { message: string }).message
          : `Falha ao chamar o fluxo n8n (HTTP ${response.status}).`;
      throw new N8nRequestError(message, response.status);
    }

    const nested =
      typeof data === "object" && data !== null && "body" in data
        ? (data as { body: unknown }).body
        : data;

    return parseResponse(nested);
  } catch (err) {
    if (err instanceof N8nRequestError || err instanceof N8nConfigError) {
      throw err;
    }
    if (err instanceof Error && err.name === "AbortError") {
      throw new N8nRequestError(
        "O fluxo de IA demorou demais. Tente novamente em instantes."
      );
    }
    throw new N8nRequestError(
      "Não foi possível conectar ao fluxo n8n. Verifique se o n8n está em execução."
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
