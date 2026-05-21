import { AuthHeader } from "@/features/auth/components/auth-header";
import { TeacherMobileNav } from "@/features/teacher/components/teacher-mobile-nav";
import { TeacherSidebar } from "@/features/teacher/components/teacher-sidebar";

export default function TeacherAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <AuthHeader />
      <TeacherMobileNav />
      <div className="flex min-h-0 flex-1">
        <TeacherSidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
