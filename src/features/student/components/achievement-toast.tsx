interface AchievementToastProps {
  message: string | null;
}

export function AchievementToast({ message }: AchievementToastProps) {
  if (!message) return null;

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
      <p className="text-sm font-medium text-foreground">{message}</p>
      <span role="status" aria-live="polite" className="sr-only">
        {message}
      </span>
    </div>
  );
}
