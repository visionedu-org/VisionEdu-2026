import { StudentMobileNav } from "@/features/student/components/student-mobile-nav";
import { StudentTopBar } from "@/features/student/components/student-top-bar";

export default function StudentAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-background">
      <StudentTopBar />
      <StudentMobileNav />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:px-8 lg:py-6">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
