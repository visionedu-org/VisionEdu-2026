import { TeacherMobileNav } from "@/features/teacher/components/teacher-mobile-nav";
import { TeacherTopBar } from "@/features/teacher/components/teacher-top-bar";

export default function TeacherAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-background">
      <TeacherTopBar />
      <TeacherMobileNav />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:px-8 lg:py-6">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
