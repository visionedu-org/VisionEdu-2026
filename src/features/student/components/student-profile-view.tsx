"use client";

import { useEffect, useState } from "react";
import { studentService } from "@/services/student.service";
import type { StudentProfile } from "@/types/domain";
import { BadgeGrid } from "./badge-grid";
import { XpProgressBar } from "./xp-progress-bar";

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
      <div className="mx-auto w-full max-w-lg space-y-4 p-4 animate-pulse">
        <div className="h-8 w-40 rounded bg-muted" />
        <div className="h-24 rounded-xl bg-muted" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto w-full max-w-lg p-4">
        <p role="alert" className="text-destructive">
          {error ?? "Perfil indisponível."}
        </p>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-lg space-y-8 p-4">
      <h1 className="text-2xl font-bold">Meu perfil</h1>
      <XpProgressBar
        level={profile.level}
        xp={profile.xp}
        xpToNextLevel={profile.xpToNextLevel}
      />
      <BadgeGrid badges={profile.badges} />
    </main>
  );
}
