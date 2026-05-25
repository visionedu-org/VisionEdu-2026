import { MaterialDetail } from "@/features/student/components/material-detail";

export default async function StudentMaterialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <MaterialDetail materialId={id} />;
}
