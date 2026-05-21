import { BnccGapsReport } from "@/features/teacher/components/bncc-gaps-report";

interface BnccPageProps {
  params: Promise<{ classId: string }>;
}

export default async function TurmaBnccPage({ params }: BnccPageProps) {
  const { classId } = await params;
  return <BnccGapsReport classId={classId} />;
}
