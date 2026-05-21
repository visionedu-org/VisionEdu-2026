import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="py-8 px-4">
      <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Carregando…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
