"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api-client";
import { downloadMaterialAttachment } from "@/lib/materials-download";
import type { MaterialAttachmentSummary } from "@/types/materials";
import { Button } from "@/components/ui/button";

interface AttachmentDownloadButtonProps {
  attachment: MaterialAttachmentSummary;
  downloadPath: string;
  /** Rótulo do botão; padrão baseado no tipo MIME. */
  label?: string;
}

function defaultLabel(attachment: MaterialAttachmentSummary): string {
  if (attachment.mimeType === "application/pdf") {
    return "Baixar PDF";
  }
  return "Baixar arquivo";
}

export function AttachmentDownloadButton({
  attachment,
  downloadPath,
  label,
}: AttachmentDownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);
    try {
      await downloadMaterialAttachment(downloadPath, attachment.fileName);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível baixar o arquivo."
      );
    } finally {
      setLoading(false);
    }
  }

  const buttonLabel = label ?? defaultLabel(attachment);

  return (
    <div className="space-y-1">
      <Button
        type="button"
        variant="outline"
        className="min-h-11 w-full sm:w-auto"
        disabled={loading}
        onClick={() => void handleDownload()}
        aria-describedby={
          error ? `download-error-${attachment.id}` : undefined
        }
      >
        {loading ? "Baixando…" : buttonLabel}
        <span className="sr-only"> ({attachment.fileName})</span>
      </Button>
      <p className="text-xs text-muted-foreground">{attachment.fileName}</p>
      {error && (
        <p
          id={`download-error-${attachment.id}`}
          role="alert"
          className="text-xs text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
