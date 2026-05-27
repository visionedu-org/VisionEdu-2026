/** Alinhado ao enum Prisma `MaterialContentType`. */
export type MaterialContentType = "text" | "video_link" | "file" | "questions";

/** Referência persistida de uma questão ENEM em um material. */
export interface MaterialEnemQuestionRef {
  questionKey: string;
  year: number;
  index: number;
  language: string | null;
  sortOrder: number;
}

/** Payload de questão ENEM ao criar material do tipo `questions`. */
export interface MaterialEnemQuestionInput {
  year: number;
  index: number;
  language?: string | null;
}

/** Alinhado ao enum Prisma `MaterialTargetType`. */
export type MaterialTargetType = "class" | "student";

export interface MaterialClassRecipient {
  targetType: "class";
  classId: string;
}

export interface MaterialStudentRecipient {
  targetType: "student";
  classId: string;
  studentId: string;
}

export type MaterialRecipientInput =
  | MaterialClassRecipient
  | MaterialStudentRecipient;

export interface MaterialRecipient {
  id: string;
  materialId: string;
  targetType: MaterialTargetType;
  classId: string;
  studentId?: string | null;
}

export interface MaterialRecipientClassSummary {
  grade: string;
  classIdentifier: string;
  label: string;
}

export interface MaterialRecipientDetail {
  id: string;
  targetType: MaterialTargetType;
  classId: string;
  studentId?: string | null;
  studentName?: string | null;
  class: MaterialRecipientClassSummary;
}

export interface MaterialAttachmentSummary {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface EducationalMaterialDetail
  extends Omit<EducationalMaterial, "recipients"> {
  recipients: MaterialRecipientDetail[];
  attachments: MaterialAttachmentSummary[];
}

export interface MaterialListFilters {
  classId?: string;
  discipline?: string;
  contentType?: MaterialContentType;
  dateFrom?: string;
  dateTo?: string;
  q?: string;
}

export interface MaterialListResponse {
  items: MaterialListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface EducationalMaterial {
  id: string;
  teacherId: string;
  schoolId: string;
  title: string;
  description: string;
  discipline: string;
  contentType: MaterialContentType;
  bodyText: string | null;
  videoUrl: string | null;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
  recipients?: MaterialRecipient[];
}

/** Payload de criação (texto, link ou arquivo; destino turma). */
export interface CreateMaterialPayload {
  title: string;
  description: string;
  discipline: string;
  contentType: MaterialContentType;
  bodyText?: string | null;
  videoUrl?: string | null;
  recipients: MaterialRecipientInput[];
  attachmentIds?: string[];
  enemQuestions?: MaterialEnemQuestionInput[];
}

export interface ClassStudentOption {
  id: string;
  name: string;
}

/** Alinhado ao enum Prisma `MaterialLogAction`. */
export type MaterialLogAction = "created" | "updated" | "deleted" | "downloaded";

export interface MaterialHistoryEntry {
  id: string;
  action: MaterialLogAction;
  actionLabel: string;
  actorUserId: string;
  actorName: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  description: string | null;
}

export interface MaterialHistoryResponse {
  items: MaterialHistoryEntry[];
}

/** Resumo para listagens do professor. */
export interface MaterialListItem {
  id: string;
  title: string;
  description: string;
  discipline: string;
  contentType: MaterialContentType;
  sentAt: string;
  recipientCount: number;
  classLabels: string[];
}

/** Resumo para listagens do aluno (sem dados de outros usuários). */
export interface StudentMaterialListItem {
  id: string;
  title: string;
  description: string;
  discipline: string;
  contentType: MaterialContentType;
  sentAt: string;
  isNew: boolean;
}

export interface MarkMaterialReadResult {
  materialId: string;
  readAt: string;
}

export interface StudentMaterialListResponse {
  items: StudentMaterialListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** Detalhe do material para o aluno. */
export interface StudentMaterialDetail {
  id: string;
  teacherName: string;
  title: string;
  description: string;
  discipline: string;
  contentType: MaterialContentType;
  bodyText: string | null;
  videoUrl: string | null;
  sentAt: string;
  attachments: MaterialAttachmentSummary[];
  enemQuestions: MaterialEnemQuestionRef[];
}
