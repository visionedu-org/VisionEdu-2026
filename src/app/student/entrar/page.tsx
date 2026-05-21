"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_ACTIVITY_ID } from "@/mocks/data/student-fixtures";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function RedirectToActivity({ activityId }: { activityId: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/student/atividade/${activityId}`);
  }, [activityId, router]);
  return (
    <p className="p-4 text-sm text-muted-foreground">Redirecionando para a atividade…</p>
  );
}

function EntrarForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");

  const paramCode = searchParams.get("code") ?? searchParams.get("activityId");

  if (paramCode && UUID_RE.test(paramCode)) {
    return <RedirectToActivity activityId={paramCode} />;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (UUID_RE.test(trimmed)) {
      router.push(`/student/atividade/${trimmed}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-4 p-4">
      <h1 className="text-2xl font-bold">Entrar na atividade</h1>
      <p className="text-sm text-muted-foreground">
        Cole o código da atividade compartilhada pelo professor.
      </p>
      <div className="space-y-2">
        <Label htmlFor="activity-code">Código da atividade</Label>
        <Input
          id="activity-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={DEMO_ACTIVITY_ID}
          className="min-h-11"
          autoComplete="off"
        />
      </div>
      <Button type="submit" className="min-h-11 w-full">
        Entrar
      </Button>
    </form>
  );
}

export default function StudentEntrarPage() {
  return (
    <Suspense fallback={<p className="p-4 text-sm text-muted-foreground">Carregando…</p>}>
      <EntrarForm />
    </Suspense>
  );
}
