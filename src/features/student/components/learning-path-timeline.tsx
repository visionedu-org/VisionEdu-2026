"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Lock } from "lucide-react";
import type { LearningPathModule, LearningPathModuleStatus } from "@/types/domain";
import { cn } from "@/lib/utils";

const statusLabels: Record<LearningPathModuleStatus, string> = {
  locked: "bloqueado",
  in_progress: "em progresso",
  completed: "concluído",
};

function ModuleIcon({ status }: { status: LearningPathModuleStatus }) {
  if (status === "locked") {
    return <Lock className="size-5 text-muted-foreground" aria-hidden />;
  }
  if (status === "completed") {
    return <CheckCircle2 className="size-5 text-emerald-600" aria-hidden />;
  }
  return <Circle className="size-5 text-primary fill-primary/20" aria-hidden />;
}

interface LearningPathTimelineProps {
  modules: LearningPathModule[];
  onLockedPress?: () => void;
}

export function LearningPathTimeline({
  modules,
  onLockedPress,
}: LearningPathTimelineProps) {
  const router = useRouter();

  function handlePress(module: LearningPathModule) {
    if (module.status === "locked") {
      onLockedPress?.();
      return;
    }
    if (module.pathId) {
      router.push(`/student/trilha/etapa/${module.id}`);
      return;
    }
    if (module.activityId) {
      router.push(`/student/atividade/${module.activityId}`);
    }
  }

  return (
    <div
      className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="list"
      aria-label="Trilha de aprendizagem"
    >
      {modules.map((module, index) => (
        <div key={module.id} className="flex shrink-0 items-center gap-2" role="listitem">
          {index > 0 && (
            <div
              className="h-0.5 w-6 shrink-0 bg-border"
              aria-hidden
            />
          )}
          <button
            type="button"
            onClick={() => handlePress(module)}
            disabled={module.status === "locked" && !module.activityId}
            aria-label={`Módulo ${module.title}, ${statusLabels[module.status]}`}
            className={cn(
              "flex w-24 flex-col items-center gap-2 rounded-lg p-2 transition-colors",
              module.status !== "locked" && "hover:bg-muted/50",
              "min-h-11 min-w-11"
            )}
          >
            <span
              className={cn(
                "flex size-12 items-center justify-center rounded-full border-2",
                module.status === "locked" && "border-muted bg-muted/30",
                module.status === "in_progress" && "border-primary bg-primary/10",
                module.status === "completed" && "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
              )}
            >
              <ModuleIcon status={module.status} />
            </span>
            <span className="line-clamp-2 text-center text-xs font-medium leading-tight">
              {module.title}
            </span>
          </button>
        </div>
      ))}
    </div>
  );
}
