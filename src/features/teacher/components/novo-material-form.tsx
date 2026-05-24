"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { ContentForm } from "@/features/teacher/components/content-form";

function NovoMaterialFormInner() {
  const searchParams = useSearchParams();
  const rawClassId = searchParams.get("classId");
  const initialClassId =
    rawClassId && z.string().uuid().safeParse(rawClassId).success
      ? rawClassId
      : undefined;

  return <ContentForm initialClassId={initialClassId} />;
}

export function NovoMaterialForm() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted-foreground" role="status">
          Carregando formulário…
        </p>
      }
    >
      <NovoMaterialFormInner />
    </Suspense>
  );
}
