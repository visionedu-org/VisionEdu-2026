"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { studentService } from "@/services/student.service";
import { ApiError } from "@/lib/api-client";
import { getVideoEmbedUrl } from "@/lib/materials-video";
import type { MaterialContentType, StudentMaterialDetail } from "@/types/materials";
import { Button } from "@/components/ui/button";
import { AttachmentDownloadButton } from "@/components/materials/attachment-download-button";
import { getStudentAttachmentDownloadPath } from "@/lib/materials-download";

const CONTENT_TYPE_LABELS: Record<MaterialContentType, string> = {
  text: "Texto",
  video_link: "Vídeo",
  file: "Arquivo",
};

function formatSentAt(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(iso));
}

interface MaterialDetailProps {
  materialId: string;
}

export function MaterialDetail({ materialId }: MaterialDetailProps) {
  const [material, setMaterial] = useState<StudentMaterialDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const data = await studentService.getMaterial(materialId);
        if (!cancelled) {
          setMaterial(data);
          void studentService.markMaterialRead(materialId).catch(() => undefined);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && err.status === 404) {
            setNotFound(true);
          } else {
            setError(
              err instanceof ApiError
                ? err.message
                : "Não foi possível carregar o material."
            );
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [materialId]);

  async function handleRetry() {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const data = await studentService.getMaterial(materialId);
      setMaterial(data);
      void studentService.markMaterialRead(materialId).catch(() => undefined);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : "Não foi possível carregar o material."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse" role="status" aria-live="polite">
        <p className="sr-only">Carregando material…</p>
        <div className="h-8 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
        <div className="h-32 rounded-xl bg-muted" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="space-y-4" role="status">
        <p className="font-medium">Material não encontrado</p>
        <p className="text-sm text-muted-foreground">
          Este conteúdo não está disponível para você ou foi removido.
        </p>
        <Link
          href="/student/materiais"
          className="inline-flex min-h-11 items-center text-primary font-medium underline-offset-2 hover:underline"
        >
          Voltar aos materiais
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
      >
        <p>{error}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-3 min-h-11"
          onClick={() => void handleRetry()}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!material) return null;

  const embedUrl =
    material.contentType === "video_link" && material.videoUrl
      ? getVideoEmbedUrl(material.videoUrl)
      : null;

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {material.discipline} · {CONTENT_TYPE_LABELS[material.contentType]}
        </p>
        <h1 className="text-2xl font-bold leading-tight">{material.title}</h1>
        <p className="text-sm text-muted-foreground">
          Enviado em {formatSentAt(material.sentAt)}
        </p>
      </header>

      {material.description && (
        <section className="space-y-1">
          <h2 className="text-sm font-medium text-muted-foreground">
            Descrição
          </h2>
          <p className="text-sm leading-relaxed">{material.description}</p>
        </section>
      )}

      {material.contentType === "text" && material.bodyText && (
        <section className="space-y-2" aria-labelledby="material-body-heading">
          <h2
            id="material-body-heading"
            className="text-sm font-medium text-muted-foreground"
          >
            Conteúdo
          </h2>
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {material.bodyText}
            </p>
          </div>
        </section>
      )}

      {material.attachments.length > 0 && (
        <section
          className="space-y-3"
          aria-labelledby="material-attachments-heading"
        >
          <h2
            id="material-attachments-heading"
            className="text-sm font-medium text-muted-foreground"
          >
            Arquivos
          </h2>
          <ul className="space-y-2">
            {material.attachments.map((attachment) => (
              <li key={attachment.id}>
                <AttachmentDownloadButton
                  attachment={attachment}
                  downloadPath={getStudentAttachmentDownloadPath(
                    material.id,
                    attachment.id
                  )}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {material.contentType === "video_link" && material.videoUrl && (
        <section className="space-y-3" aria-labelledby="material-video-heading">
          <h2
            id="material-video-heading"
            className="text-sm font-medium text-muted-foreground"
          >
            Vídeo
          </h2>

          {embedUrl ? (
            <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-black">
              <iframe
                src={embedUrl}
                title={`Vídeo: ${material.title}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : null}

          <a
            href={material.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            {embedUrl ? "Abrir vídeo em nova aba" : "Assistir ao vídeo (link externo)"}
          </a>
        </section>
      )}

      <Link
        href="/student/materiais"
        className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-2 hover:underline"
      >
        ← Voltar aos materiais
      </Link>
    </article>
  );
}
