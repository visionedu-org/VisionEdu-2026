import { ActivityPlayer } from "@/features/student/components/activity-player";
import { notFound } from "next/navigation";
import { demoActivities } from "@/mocks/data/student-fixtures";
import { getActivityById } from "@/mocks/teacher-content-memory";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function resolveActivity(id: string) {
  return demoActivities[id] ?? getActivityById(id);
}

export default async function StudentAtividadePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_RE.test(id) || !resolveActivity(id)) {
    notFound();
  }
  return <ActivityPlayer activityId={id} />;
}
