import { AuthHeader } from "@/features/auth/components/auth-header";
import { StudentBottomNav } from "@/features/student/components/student-bottom-nav";

export default function StudentAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-slate-50 dark:bg-slate-950">
      <AuthHeader />
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>
      <StudentBottomNav />
    </div>
  );
}
