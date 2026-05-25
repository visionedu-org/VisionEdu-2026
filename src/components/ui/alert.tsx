import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-xl border px-4 py-3 text-sm fluent-transition [&>svg]:absolute [&>svg]:top-3 [&>svg]:left-4 [&>svg+div]:pl-7",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-foreground",
        destructive:
          "border-brand-red/30 bg-brand-red/10 text-brand-red dark:text-red-400",
        success:
          "border-brand-green/30 bg-brand-green/10 text-emerald-800 dark:text-brand-green",
        warning:
          "border-brand-yellow/40 bg-brand-yellow/15 text-amber-900 dark:text-brand-yellow",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"h5">) {
  return (
    <h5
      data-slot="alert-title"
      className={cn("mb-1 font-semibold leading-none", className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, alertVariants };
