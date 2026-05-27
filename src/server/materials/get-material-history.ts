import type { MaterialLogAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  MaterialContentType,
  MaterialHistoryEntry,
  MaterialHistoryResponse,
} from "@/types/materials";
import { MaterialNotFoundError } from "@/server/materials/get-material-by-id";
import { TeacherProfileNotFoundError } from "@/server/materials/create-material";

const ACTION_LABELS: Record<MaterialLogAction, string> = {
  created: "Criado",
  updated: "Atualizado",
  deleted: "Excluído",
  downloaded: "Baixado",
};

const CONTENT_TYPE_LABELS: Record<MaterialContentType, string> = {
  text: "Texto",
  video_link: "Link de vídeo",
  file: "Arquivo",
  questions: "Questões",
};

function mapActionLabel(action: MaterialLogAction): string {
  return ACTION_LABELS[action] ?? action;
}

function metadataToRecord(metadata: unknown): Record<string, unknown> | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }
  return metadata as Record<string, unknown>;
}

function describeHistoryEntry(
  action: MaterialLogAction,
  metadata: Record<string, unknown> | null
): string | null {
  if (!metadata) return null;

  if (action === "created") {
    const parts: string[] = [];
    const recipientCount = metadata.recipientCount;
    const attachmentCount = metadata.attachmentCount;
    if (typeof recipientCount === "number" && recipientCount > 0) {
      parts.push(
        `${recipientCount} destinatário${recipientCount === 1 ? "" : "s"}`
      );
    }
    if (typeof attachmentCount === "number" && attachmentCount > 0) {
      parts.push(`${attachmentCount} anexo${attachmentCount === 1 ? "" : "s"}`);
    }
    const contentType = metadata.contentType;
    if (typeof contentType === "string" && contentType.length > 0) {
      const typeLabel =
        CONTENT_TYPE_LABELS[contentType as MaterialContentType] ?? contentType;
      parts.push(`tipo: ${typeLabel}`);
    }
    return parts.length > 0 ? parts.join(" · ") : null;
  }

  if (action === "downloaded") {
    const attachmentId = metadata.attachmentId;
    if (typeof attachmentId === "string" && attachmentId.length > 0) {
      return "Download de anexo";
    }
  }

  return null;
}

export async function getMaterialHistory(
  teacherUserId: string,
  materialId: string
): Promise<MaterialHistoryResponse> {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId: teacherUserId },
    select: { id: true },
  });

  if (!teacher) {
    throw new TeacherProfileNotFoundError();
  }

  const material = await prisma.educationalMaterial.findUnique({
    where: { id: materialId },
    select: { teacherId: true },
  });

  if (!material || material.teacherId !== teacher.id) {
    throw new MaterialNotFoundError();
  }

  const logs = await prisma.materialDeliveryLog.findMany({
    where: { materialId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      action: true,
      actorUserId: true,
      metadata: true,
      createdAt: true,
      actor: { select: { name: true } },
    },
  });

  const items: MaterialHistoryEntry[] = logs.map((log) => {
    const metadata = metadataToRecord(log.metadata);
    const action = log.action as MaterialLogAction;

    return {
      id: log.id,
      action,
      actionLabel: mapActionLabel(action),
      actorUserId: log.actorUserId,
      actorName: log.actor.name,
      metadata,
      createdAt: log.createdAt.toISOString(),
      description: describeHistoryEntry(action, metadata),
    };
  });

  return { items };
}
