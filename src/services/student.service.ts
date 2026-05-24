import { apiClient } from "@/lib/api-client";
import { buildMaterialsListQuery } from "@/lib/materials-list-query";
import type {
  Activity,
  ActivityAnswer,
  ActivitySubmitResult,
  LearningPathModule,
  StudentDashboardData,
  StudentProfile,
} from "@/types/domain";
import type {
  MarkMaterialReadResult,
  MaterialListFilters,
  StudentMaterialDetail,
  StudentMaterialListResponse,
} from "@/types/materials";

export const studentService = {
  getDashboard(): Promise<StudentDashboardData> {
    return apiClient.get<StudentDashboardData>("/api/v1/students/me/dashboard");
  },

  getProfile(): Promise<StudentProfile> {
    return apiClient.get<StudentProfile>("/api/v1/students/me/profile");
  },

  getLearningPath(): Promise<{ modules: LearningPathModule[] }> {
    return apiClient.get<{ modules: LearningPathModule[] }>(
      "/api/v1/students/me/learning-path"
    );
  },

  listMaterials(params?: {
    page?: number;
    pageSize?: number;
    filters?: MaterialListFilters;
  }): Promise<StudentMaterialListResponse> {
    const query = buildMaterialsListQuery(params);
    return apiClient.get<StudentMaterialListResponse>(
      `/api/v1/students/me/materials${query ? `?${query}` : ""}`
    );
  },

  getMaterial(id: string): Promise<StudentMaterialDetail> {
    return apiClient.get<StudentMaterialDetail>(
      `/api/v1/students/me/materials/${encodeURIComponent(id)}`
    );
  },

  markMaterialRead(id: string): Promise<MarkMaterialReadResult> {
    return apiClient.patch<MarkMaterialReadResult>(
      `/api/v1/students/me/materials/${encodeURIComponent(id)}/read`
    );
  },

  getActivity(id: string): Promise<Activity> {
    return apiClient.get<Activity>(`/api/v1/activities/${id}`);
  },

  submitActivity(
    id: string,
    answers: ActivityAnswer[]
  ): Promise<ActivitySubmitResult> {
    return apiClient.post<ActivitySubmitResult>(
      `/api/v1/students/activities/${id}/submit`,
      { answers }
    );
  },
};
