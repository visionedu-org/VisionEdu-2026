import { apiClient } from "@/lib/api-client";
import type {
  Activity,
  BnccGapRow,
  ClassDashboardData,
  TeacherActivityCreatePayload,
  TeacherContent,
} from "@/types/domain";

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

  createContent(
    payload: Omit<TeacherContent, "id" | "createdAt">
  ): Promise<{ id: string }> {
    return apiClient.post<{ id: string }>(
      "/api/v1/teachers/contents",
      payload
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
