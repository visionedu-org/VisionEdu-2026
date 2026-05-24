import { MaterialDetail } from "@/features/student/components/material-detail";

export default async function StudentMaterialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-lg space-y-4 overflow-x-hidden p-4">
      <MaterialDetail materialId={id} />
    </div>
  );
}
