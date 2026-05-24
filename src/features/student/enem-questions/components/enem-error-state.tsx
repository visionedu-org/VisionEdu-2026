import { Button } from "@/components/ui/button";

interface EnemErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function EnemErrorState({ message, onRetry }: EnemErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-4"
    >
      <p className="text-sm text-destructive">{message}</p>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          className="mt-3 min-h-11"
          onClick={onRetry}
        >
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
