import { ApiError } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-error-messages";

const ENEM_RATE_LIMIT_MESSAGE =
  "Muitas requisições em pouco tempo. Aguarde alguns segundos e tente novamente.";

export function getEnemApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return ENEM_RATE_LIMIT_MESSAGE;
    }
    return getApiErrorMessage(undefined, error.status, error.message);
  }
  return "Não foi possível carregar as questões.";
}
