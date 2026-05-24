import { apiClient, type UploadFileResult } from "@/lib/api-client";
import type {
  Activity,
  BnccGapRow,
  ClassDashboardData,
  TeacherActivityCreatePayload,
  TeacherContent,
} from "@/types/domain";
import { buildMaterialsListQuery } from "@/lib/materials-list-query";
import type {
  ClassStudentOption,
  CreateMaterialPayload,
  EducationalMaterialDetail,
  MaterialHistoryResponse,
  MaterialListFilters,
  MaterialListResponse,
} from "@/types/materials";
import type { ClassGroup } from "@/types/domain";
import { pilotClasses } from "@/mocks/data/ceti-seed";

export const teacherService = {
  getClassDashboard(classId: string): Promise<ClassDashboardData> {
    return apiClient.get<ClassDashboardData>(
      `/api/v1/teachers/classes/${encodeURIComponent(classId)}/dashboard`
    );
  },

  getBnccGaps(classId: string): Promise<{ gaps: BnccGapRow[] }> {
    return apiClient.get<{ gaps: BnccGapRow[] }>(
      `/api/v1/teachers/classes/${encodeURIComponent(classId)}/bncc-gaps`
    );
  },

  createMaterial(
    payload: CreateMaterialPayload
  ): Promise<{ id: string; sentAt: string }> {
    return apiClient.post<{ id: string; sentAt: string }>(
      "/api/v1/teachers/materials",
      payload
    );
  },

  uploadMaterialFile(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<UploadFileResult> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.uploadFile<UploadFileResult>(
      "/api/v1/teachers/materials/upload",
      formData,
      onProgress
    );
  },

  /** @deprecated Use `createMaterial`. Mantido para compatibilidade temporária. */
  async createContent(
    payload: Omit<TeacherContent, "id" | "createdAt">
  ): Promise<{ id: string }> {
    const classGroup = pilotClasses.find(
      (c) =>
        c.grade === payload.grade &&
        c.class_identifier === payload.class_identifier
    );
    if (!classGroup) {
      throw new Error("Turma não encontrada para o envio do material.");
    }

    const contentType =
      payload.type === "pdf_upload" ? "file" : payload.type;

    const result = await this.createMaterial({
      title: payload.title,
      description: payload.description,
      discipline: payload.discipline,
      contentType,
      bodyText: contentType === "text" ? payload.description : null,
      videoUrl: null,
      recipients: [{ targetType: "class", classId: classGroup.id }],
    });

    return { id: result.id };
  },

  listMaterials(params?: {
    page?: number;
    pageSize?: number;
    filters?: MaterialListFilters;
  }): Promise<MaterialListResponse> {
    const query = buildMaterialsListQuery(params);
    return apiClient.get<MaterialListResponse>(
      `/api/v1/teachers/materials${query ? `?${query}` : ""}`
    );
  },

  getMaterial(id: string): Promise<EducationalMaterialDetail> {
    return apiClient.get<EducationalMaterialDetail>(
      `/api/v1/teachers/materials/${encodeURIComponent(id)}`
    );
  },

  deleteMaterial(id: string): Promise<{ id: string; deletedAt: string }> {
    return apiClient.delete<{ id: string; deletedAt: string }>(
      `/api/v1/teachers/materials/${encodeURIComponent(id)}`
    );
  },

  getMaterialHistory(id: string): Promise<MaterialHistoryResponse> {
    return apiClient.get<MaterialHistoryResponse>(
      `/api/v1/teachers/materials/${encodeURIComponent(id)}/history`
    );
  },

  listMyClasses(): Promise<{ classes: ClassGroup[] }> {
    return apiClient.get<{ classes: ClassGroup[] }>(
      "/api/v1/teachers/me/classes"
    );
  },

  listClassStudents(classId: string): Promise<{ students: ClassStudentOption[] }> {
    return apiClient.get<{ students: ClassStudentOption[] }>(
      `/api/v1/teachers/classes/${encodeURIComponent(classId)}/students`
    );
  },

  createActivity(
    payload: TeacherActivityCreatePayload
  ): Promise<{ id: string; title: string; questions: Activity["questions"] }> {
    return apiClient.post<{
      id: string;
      title: string;
      questions: Activity["questions"];
    }>("/api/v1/teachers/activities", payload);
  },

  getActivity(id: string): Promise<Activity> {
    return apiClient.get<Activity>(
      `/api/v1/teachers/activities/${encodeURIComponent(id)}`
    );
  },
};
