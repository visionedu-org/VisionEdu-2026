import type {
  Activity,
  TeacherActivityCreatePayload,
  TeacherContent,
} from "@/types/domain";

const contents = new Map<string, TeacherContent>();
const activities = new Map<string, Activity>();

function payloadToActivity(
  id: string,
  payload: TeacherActivityCreatePayload
): Activity {
  return {
    id,
    title: payload.title,
    description: payload.description,
    questions: payload.questions.map((q, i) => ({
      id: `${id}-q${i + 1}`,
      prompt: q.prompt,
      options: q.options.map((text, j) => ({
        id: `${id}-q${i + 1}-opt${j}`,
        text,
      })),
    })),
  };
}

export function addContent(content: TeacherContent): void {
  contents.set(content.id, content);
}

export function addActivity(
  id: string,
  payload: TeacherActivityCreatePayload
): Activity {
  const activity = payloadToActivity(id, payload);
  activities.set(id, activity);
  return activity;
}

export function getActivityById(id: string): Activity | undefined {
  return activities.get(id);
}
