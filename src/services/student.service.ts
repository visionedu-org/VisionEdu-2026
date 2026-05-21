import { apiClient } from "@/lib/api-client";
import type {
  Activity,
  ActivityAnswer,
  ActivitySubmitResult,
  LearningPathModule,
  StudentDashboardData,
  StudentProfile,
} from "@/types/domain";

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
