export type UserRole = "student" | "teacher" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  school_id?: string;
  grade?: string;
  class_identifier?: string;
  teacher_classes?: TeacherClassAssignment[];
}

export interface TeacherClassAssignment {
  school_id: string;
  grade: string;
  class_identifier: string;
}

export interface School {
  id: string;
  name: string;
  gre?: string;
  city?: string;
}

export interface ClassGroup {
  id: string;
  school_id: string;
  grade: string;
  class_identifier: string;
  label: string;
}

export interface AuthResponse {
  access_token: string;
  expires_in: number;
  user: User;
}

export interface ApiFieldErrors {
  [field: string]: string;
}

export type LearningPathModuleStatus = "locked" | "in_progress" | "completed";

export interface LearningPathModule {
  id: string;
  title: string;
  status: LearningPathModuleStatus;
  activityId?: string;
}

export interface PendingActivitySummary {
  id: string;
  title: string;
  status: "not_started" | "in_progress";
}

export interface StudentDashboardData {
  schoolName: string;
  grade: string;
  classIdentifier: string;
  averageScore: number;
  activitiesCompleted: number;
  activitiesTotal: number;
  pendingActivities: PendingActivitySummary[];
}

export interface McqOption {
  id: string;
  text: string;
}

export interface ActivityQuestion {
  id: string;
  prompt: string;
  options: McqOption[];
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  questions: ActivityQuestion[];
}

export interface ActivityAnswer {
  questionId: string;
  optionId: string;
}

export interface ActivityDraft {
  answers: ActivityAnswer[];
  currentIndex: number;
  updatedAt: string;
}

export type BadgeId = "first_activity" | "high_score" | "path_starter";

export interface BadgeDefinition {
  id: BadgeId;
  title: string;
  description: string;
  icon: "trophy" | "star" | "route";
}

export interface StudentBadgeState {
  id: BadgeId;
  unlockedAt: string | null;
}

export interface StudentProfile {
  xp: number;
  level: number;
  xpToNextLevel: number;
  badges: StudentBadgeState[];
}

export interface ActivitySubmitResult {
  score: number;
  status: "completed";
  xpEarned: number;
  totalXp: number;
  level: number;
  levelUp?: boolean;
  badgesUnlocked: BadgeId[];
}

export interface ClassDashboardData {
  classLabel: string;
  studentCount: number;
  averageScore: number;
  topErrors: Array<{ concept: string; errorRate: number }>;
}

export type BnccDifficulty = "high" | "medium" | "low";

export interface BnccGapRow {
  code: string;
  description: string;
  masteryPercent: number;
  difficulty: BnccDifficulty;
}

export type TeacherContentType = "text" | "video_link" | "pdf_upload";

export interface TeacherContent {
  id: string;
  title: string;
  description: string;
  discipline: string;
  grade: string;
  class_identifier: string;
  type: TeacherContentType;
  createdAt: string;
}

export interface TeacherActivityQuestionPayload {
  prompt: string;
  options: [string, string, string, string];
  bnccCode: string;
  correctOptionIndex: number;
}

export interface TeacherActivityCreatePayload {
  title: string;
  description?: string;
  grade: string;
  class_identifier: string;
  questions: TeacherActivityQuestionPayload[];
}
