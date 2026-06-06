import { StudentPerformancePage } from "@/features/teacher/components/student-performance-page";

interface AlunoPageProps {
  params: Promise<{ classId: string; studentId: string }>;
}

export default async function AlunoPerformancePage({ params }: AlunoPageProps) {
  const { classId, studentId } = await params;
  return <StudentPerformancePage classId={classId} studentId={studentId} />;
}
