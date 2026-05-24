"use client";

import type { MaterialHistoryEntry } from "@/types/materials";

function formatHistoryTimestamp(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

interface MaterialHistoryTimelineProps {
  entries: MaterialHistoryEntry[];
}

export function MaterialHistoryTimeline({ entries }: MaterialHistoryTimelineProps) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Nenhum evento registrado para este material.
      </p>
    );
  }

  return (
    <ol className="relative space-y-0 border-l border-border pl-6">
      {entries.map((entry, index) => (
        <li key={entry.id} className="pb-6 last:pb-0">
          <span
            className="absolute -left-1.5 mt-1.5 size-3 rounded-full border-2 border-background bg-primary"
            aria-hidden
          />
          <div className="space-y-1">
            <p className="text-sm font-semibold leading-snug">
              <span>{entry.actionLabel}</span>
              <span className="sr-only"> em </span>
              <time
                dateTime={entry.createdAt}
                className="font-normal text-muted-foreground"
              >
                {" "}
                · {formatHistoryTimestamp(entry.createdAt)}
              </time>
            </p>
            <p className="text-sm text-muted-foreground">
              Por {entry.actorName}
            </p>
            {entry.description && (
              <p className="text-sm text-foreground/80">{entry.description}</p>
            )}
          </div>
          {index < entries.length - 1 ? (
            <span className="sr-only">; próximo evento</span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
