import { cn } from "@/lib/utils";

interface AppPageProps {
  children: React.ReactNode;
  className?: string;
}

/** Container de página em largura total (padding vem do layout da área autenticada). */
export function AppPage({ children, className }: AppPageProps) {
  return <div className={cn("w-full space-y-6", className)}>{children}</div>;
}
