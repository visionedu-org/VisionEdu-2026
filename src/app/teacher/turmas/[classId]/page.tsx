import { ClassDashboard } from "@/features/teacher/components/class-dashboard";

interface TurmaPageProps {
  params: Promise<{ classId: string }>;
}

export default async function TurmaDashboardPage({ params }: TurmaPageProps) {
  const { classId } = await params;
  return <ClassDashboard classId={classId} />;
}
