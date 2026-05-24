import { NovoMaterialForm } from "@/features/teacher/components/novo-material-form";

export default function NovoConteudoPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Novo material</h1>
        <p className="text-sm text-muted-foreground">
          Envie textos, links de vídeo ou arquivos para turmas ou alunos
          vinculados ao seu perfil.
        </p>
      </header>
      <NovoMaterialForm />
    </div>
  );
}
