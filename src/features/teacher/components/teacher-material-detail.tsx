"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { teacherService } from "@/services/teacher.service";
import { ApiError } from "@/lib/api-client";
import { AttachmentDownloadButton } from "@/components/materials/attachment-download-button";
import { getTeacherAttachmentDownloadPath } from "@/lib/materials-download";
import type {
  EducationalMaterialDetail,
  MaterialContentType,
  MaterialHistoryEntry,
} from "@/types/materials";
import { MaterialHistoryTimeline } from "@/features/teacher/components/material-history-timeline";
import { Button } from "@/components/ui/button";

const CONTENT_TYPE_LABELS: Record<MaterialContentType, string> = {
  text: "Texto",
  video_link: "Link de vídeo",
  file: "Arquivo",
  questions: "Questões",
};

function formatSentAt(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(iso));
}

function formatRecipientSummary(
  recipients: EducationalMaterialDetail["recipients"]
): string {
  if (recipients.length === 0) return "—";
  return recipients
    .map((recipient) => {
      if (recipient.targetType === "student" && recipient.studentName) {
        return `${recipient.class.label} — ${recipient.studentName}`;
      }
      return recipient.class.label;
    })
    .join(", ");
}

interface TeacherMaterialDetailProps {
  materialId: string;
}

export function TeacherMaterialDetail({ materialId }: TeacherMaterialDetailProps) {
  const router = useRouter();
  const [material, setMaterial] = useState<EducationalMaterialDetail | null>(
    null
  );
  const [history, setHistory] = useState<MaterialHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const [materialData, historyData] = await Promise.all([
          teacherService.getMaterial(materialId),
          teacherService.getMaterialHistory(materialId),
        ]);
        if (!cancelled) {
          setMaterial(materialData);
          setHistory(historyData.items);
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
      const [materialData, historyData] = await Promise.all([
        teacherService.getMaterial(materialId),
        teacherService.getMaterialHistory(materialId),
      ]);
      setMaterial(materialData);
      setHistory(historyData.items);
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
        <p className="sr-only">Carregando material e histórico…</p>
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
          Este material não existe ou não pertence à sua conta.
        </p>
        <Link
          href="/teacher/materiais"
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

  async function handleDelete() {
    const confirmed = window.confirm(
      "Excluir este material? Os alunos deixarão de visualizá-lo."
    );
    if (!confirmed) return;

    setDeleting(true);
    setDeleteError(null);
    try {
      await teacherService.deleteMaterial(materialId);
      router.push("/teacher/materiais");
    } catch (err) {
      setDeleteError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível excluir o material."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (!material) return null;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {material.discipline} · {CONTENT_TYPE_LABELS[material.contentType]}
        </p>
        <h1 className="text-2xl font-bold leading-tight">{material.title}</h1>
        <p className="text-sm text-muted-foreground">
          Enviado em {formatSentAt(material.sentAt)}
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 border-destructive/40 text-destructive hover:bg-destructive/10"
            disabled={deleting}
            aria-busy={deleting}
            onClick={() => void handleDelete()}
          >
            {deleting ? "Excluindo…" : "Excluir material"}
          </Button>
        </div>
        {deleteError && (
          <p role="alert" className="text-sm text-destructive">
            {deleteError}
          </p>
        )}
      </header>

      <section className="space-y-3 text-sm" aria-labelledby="material-info-heading">
        <h2 id="material-info-heading" className="text-base font-semibold">
          Informações
        </h2>
        <p>
          <span className="text-muted-foreground">Destinatários: </span>
          {formatRecipientSummary(material.recipients)}
        </p>
        {material.description && (
          <p>
            <span className="text-muted-foreground">Descrição: </span>
            {material.description}
          </p>
        )}
        {material.contentType === "text" && material.bodyText && (
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="mb-1 font-medium text-muted-foreground">Conteúdo</p>
            <p className="whitespace-pre-wrap">{material.bodyText}</p>
          </div>
        )}
        {material.contentType === "video_link" && material.videoUrl && (
          <p>
            <span className="text-muted-foreground">Vídeo: </span>
            <a
              href={material.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-2 hover:underline"
            >
              Abrir link
            </a>
          </p>
        )}
        {material.attachments.length > 0 && (
          <div className="space-y-2">
            <p className="font-medium text-muted-foreground">Anexos</p>
            <ul className="space-y-2">
              {material.attachments.map((attachment) => (
                <li key={attachment.id}>
                  <AttachmentDownloadButton
                    attachment={attachment}
                    downloadPath={getTeacherAttachmentDownloadPath(
                      material.id,
                      attachment.id
                    )}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section
        className="space-y-4"
        aria-labelledby="material-history-heading"
      >
        <h2 id="material-history-heading" className="text-base font-semibold">
          Histórico de envio
        </h2>
        <MaterialHistoryTimeline entries={history} />
      </section>

      <Link
        href="/teacher/materiais"
        className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-2 hover:underline"
      >
        ← Voltar aos materiais
      </Link>
    </div>
  );
}
