"use client";

import { useEffect, useState } from "react";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export function MswProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!useMock);

  useEffect(() => {
    if (!useMock) return;

    async function init() {
      const { worker } = await import("@/mocks/browser");
      await worker.start({ onUnhandledRequest: "bypass" });
      setReady(true);
    }

    void init();
  }, []);

  if (!ready) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
        Carregando ambiente de demonstração…
      </div>
    );
  }

  return <>{children}</>;
}
