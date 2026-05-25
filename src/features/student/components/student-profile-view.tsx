"use client";

import { useEffect, useState } from "react";
import { studentService } from "@/services/student.service";
import type { StudentProfile } from "@/types/domain";
import { AppPage } from "@/components/layout/app-page";
import { BadgeGrid } from "./badge-grid";
import { XpProgressBar } from "./xp-progress-bar";
import { Skeleton } from "@/components/ui/skeleton";

export function StudentProfileView() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await studentService.getProfile();
        if (!cancelled) setProfile(data);
      } catch {
        if (!cancelled) setError("Não foi possível carregar seu perfil.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <AppPage>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full max-w-xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </AppPage>
    );
  }

  if (error || !profile) {
    return (
      <AppPage>
        <p role="alert" className="text-destructive">
          {error ?? "Perfil indisponível."}
        </p>
      </AppPage>
    );
  }

  return (
    <AppPage>
      <h1 className="text-2xl font-bold">Meu perfil</h1>
      <div className="max-w-2xl">
        <XpProgressBar
          level={profile.level}
          xp={profile.xp}
          xpToNextLevel={profile.xpToNextLevel}
        />
      </div>
      <BadgeGrid badges={profile.badges} />
    </AppPage>
  );
}
