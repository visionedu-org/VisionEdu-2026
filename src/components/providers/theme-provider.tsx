"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

/**
 * React 19 não executa <script> dentro de componentes client.
 * O script de tema roda no HTML do servidor; no cliente usamos type="text/template"
 * apenas para evitar o aviso (o tema já foi aplicado no SSR).
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const scriptProps = React.useMemo(
    () =>
      typeof window === "undefined"
        ? { suppressHydrationWarning: true as const }
        : ({
            suppressHydrationWarning: true,
            type: "text/template",
          } as const),
    []
  );

  return (
    <NextThemesProvider {...props} scriptProps={scriptProps}>
      {children}
    </NextThemesProvider>
  );
}
