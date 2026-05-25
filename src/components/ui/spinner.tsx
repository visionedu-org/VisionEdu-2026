import { cn } from "@/lib/utils";

interface SpinnerProps extends React.ComponentProps<"div"> {
  size?: "sm" | "md" | "lg";
  label?: string;
}

const sizeClasses = {
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-8 border-[3px]",
};

export function Spinner({
  className,
  size = "md",
  label = "Carregando",
  ...props
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-primary/25 border-t-primary",
          sizeClasses[size]
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
