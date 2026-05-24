"use client";

import { useEffect, useState } from "react";
import { Clock, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface EnemSimulationTimerProps {
  enabled: boolean;
}

export function EnemSimulationTimer({ enabled }: EnemSimulationTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!enabled || !running) return;
    const id = window.setInterval(() => {
      setSeconds((v) => v + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [enabled, running]);

  if (!enabled) return null;

  return (
    <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Clock className="size-4 text-primary" aria-hidden />
        <span aria-live="polite">{formatElapsed(seconds)}</span>
      </div>
      <div className="flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={running ? "Pausar cronômetro" : "Iniciar cronômetro"}
          onClick={() => setRunning((v) => !v)}
        >
          {running ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Zerar cronômetro"
          onClick={() => {
            setSeconds(0);
            setRunning(false);
          }}
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>
    </div>
  );
}
