import { notFound } from "next/navigation";
import { ShareActivityPanel } from "@/features/teacher/components/share-activity-panel";
import { demoActivities } from "@/mocks/data/student-fixtures";
import { getActivityById } from "@/mocks/teacher-content-memory";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function resolveActivity(id: string) {
  return demoActivities[id] ?? getActivityById(id);
}

interface SharePageProps {
  params: Promise<{ activityId: string }>;
}

export default async function TeacherCompartilharPage({ params }: SharePageProps) {
  const { activityId } = await params;
  if (!UUID_RE.test(activityId)) {
    notFound();
  }

  const activity = resolveActivity(activityId);
  if (!activity) {
    notFound();
  }

  return (
    <ShareActivityPanel activityId={activity.id} title={activity.title} />
  );
}
