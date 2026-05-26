"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { LearningPathStepPlayer } from "@/features/student/components/learning-path-step-player";
import { studentService } from "@/services/student.service";
import type { LearningPathStepDetailResponse } from "@/types/learning-path-api";
import { AppPage } from "@/components/layout/app-page";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LearningPathStepPage() {
  const params = useParams<{ stepId: string }>();
  const stepId = params.stepId;
  const [data, setData] = useState<LearningPathStepDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!stepId) return;
      try {
        const response = await studentService.getLearningPathStep(stepId);
        if (!cancelled) setData(response);
      } catch {
        if (!cancelled) {
          setError(
            "Não foi possível carregar esta etapa. Ela pode estar bloqueada ou indisponível."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [stepId]);

  if (loading) {
    return (
      <AppPage>
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </AppPage>
    );
  }

  if (error || !data) {
    return (
      <AppPage className="space-y-4">
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button nativeButton={false} render={<Link href="/student/dashboard" />}>
          Voltar ao painel
        </Button>
      </AppPage>
    );
  }

  return (
    <AppPage>
      <LearningPathStepPlayer initial={data} />
    </AppPage>
  );
}
