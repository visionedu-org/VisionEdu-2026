import { DiagnosticBuilder } from "@/features/teacher/components/diagnostic-builder";

export default function NovoDiagnosticoPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Novo diagnóstico</h1>
        <p className="text-sm text-muted-foreground">
          Monte uma avaliação de múltipla escolha com até 10 questões e uma habilidade BNCC por item.
        </p>
      </header>
      <DiagnosticBuilder />
    </div>
  );
}
