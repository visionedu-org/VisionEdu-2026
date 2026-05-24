/**
 * Renderização leve de Markdown para enunciados ENEM (sem dependência extra).
 * Suporta parágrafos, negrito, itálico e quebras de linha.
 */
export function formatEnemMarkdown(text: string | null | undefined): string {
  if (!text?.trim()) return "";

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br />");
}
