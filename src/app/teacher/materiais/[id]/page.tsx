import { TeacherMaterialDetail } from "@/features/teacher/components/teacher-material-detail";

export default async function TeacherMaterialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 p-4">
      <TeacherMaterialDetail materialId={id} />
    </div>
  );
}
