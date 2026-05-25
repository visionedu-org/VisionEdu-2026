import { TeacherProfileForm } from "@/features/teacher/components/teacher-profile-form";

export default function TeacherProfilePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <TeacherProfileForm />
    </main>
  );
}
