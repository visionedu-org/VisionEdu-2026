"use client";

import { Button } from "@/components/ui/button";

interface ResumeDraftBannerProps {
  onResume: () => void;
  onRestart: () => void;
}

export function ResumeDraftBanner({ onResume, onRestart }: ResumeDraftBannerProps) {
  return (
    <div
      role="region"
      aria-label="Rascunho salvo"
      className="rounded-lg border border-primary/30 bg-primary/5 p-4"
    >
      <p className="text-sm font-medium">Continuar de onde parou?</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Encontramos respostas salvas desta atividade.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" className="min-h-11" onClick={onResume}>
          Continuar
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={onRestart}
        >
          Recomeçar
        </Button>
      </div>
    </div>
  );
}
