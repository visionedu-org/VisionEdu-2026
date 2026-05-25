import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EnemErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function EnemErrorState({ message, onRetry }: EnemErrorStateProps) {
  return (
    <Alert variant="destructive">
      <AlertDescription className="flex flex-col gap-3">
        <span>{message}</span>
        {onRetry && (
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
