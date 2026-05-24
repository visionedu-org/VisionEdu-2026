/** Mensagens amigáveis em português para códigos da API (`jsonError`). */
const API_ERROR_MESSAGES: Record<string, string> = {
  invalid_json: "Corpo da requisição inválido.",
  invalid_form: "Formulário inválido. Verifique os campos enviados.",
  validation_error: "Dados inválidos. Revise os campos e tente novamente.",
  unauthorized: "Sessão expirada ou inválida. Faça login novamente.",
  forbidden: "Você não tem permissão para esta ação.",
  not_found: "Recurso não encontrado.",
  payload_too_large: "Arquivo ou requisição muito grande.",
  unsupported_media_type: "Tipo de arquivo não permitido.",
  internal_error: "Erro interno. Tente novamente em instantes.",
};

const STATUS_FALLBACK_MESSAGES: Record<number, string> = {
  400: "Requisição inválida.",
  401: "Faça login para continuar.",
  403: "Acesso negado.",
  404: "Não encontrado.",
  413: "Arquivo muito grande.",
  415: "Tipo de arquivo não permitido.",
  500: "Erro no servidor. Tente novamente.",
};

export function getApiErrorMessage(
  code: string | undefined,
  status: number,
  serverMessage?: string
): string {
  if (code && API_ERROR_MESSAGES[code]) {
    return API_ERROR_MESSAGES[code];
  }

  if (status > 0 && STATUS_FALLBACK_MESSAGES[status]) {
    return STATUS_FALLBACK_MESSAGES[status];
  }

  if (serverMessage?.trim()) {
    return serverMessage.trim();
  }

  return "Erro na requisição. Tente novamente.";
}

/** Mensagens específicas de envio de materiais (formulário professor). */
export function getMaterialFormErrorMessage(
  code: string | undefined,
  status: number,
  serverMessage?: string
): string {
  if (status === 403) {
    return "Você não pode enviar material para esta turma. Selecione uma turma vinculada ao seu perfil.";
  }
  if (status === 413) {
    return getApiErrorMessage("payload_too_large", status, serverMessage);
  }
  if (status === 415) {
    return (
      serverMessage?.trim() ||
      "Tipo de arquivo não permitido. Use PDF ou imagem (JPEG, PNG ou WebP)."
    );
  }
  return getApiErrorMessage(code, status, serverMessage);
}
