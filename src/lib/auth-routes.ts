import type { UserRole } from "@/types/domain";

export function dashboardPathForRole(role: UserRole): string {
  switch (role) {
    case "student":
      return "/student/dashboard";
    case "teacher":
      return "/teacher/dashboard";
    default:
      return "/login";
  }
}

export function safeNextPath(
  next: string | null,
  role: UserRole
): string | null {
  if (!next || !next.startsWith("/")) return null;
  if (role === "student" && next.startsWith("/student")) return next;
  if (role === "teacher" && next.startsWith("/teacher")) return next;
  return null;
}
