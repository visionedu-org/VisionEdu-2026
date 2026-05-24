/** Header `Content-Disposition` para download com nome de arquivo seguro. */
export function buildAttachmentContentDisposition(fileName: string): string {
  const safe = fileName.replace(/["\\\r\n]/g, "_").trim() || "arquivo";
  return `attachment; filename="${safe}"`;
}
