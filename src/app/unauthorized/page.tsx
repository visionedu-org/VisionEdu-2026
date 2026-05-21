"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
export default function UnauthorizedPage() {
  const role = useAuthStore((s) => s.role);
  const homeHref =
    role === "teacher" ? "/teacher/dashboard" : "/student/dashboard";

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-foreground">Sem permissão</h1>
      <p className="mt-3 text-sm text-muted-foreground" role="status">
        Esta área é exclusiva para outro perfil de acesso. Se você acessou por
        engano, volte ao seu painel VisionEdu.
      </p>
      <Link
        href={role ? homeHref : "/login"}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        {role ? "Voltar ao meu painel" : "Ir para o login"}
      </Link>
    </main>
  );
}
