import { ContentForm } from "@/features/teacher/components/content-form";

export default function NovoConteudoPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Novo material</h1>
        <p className="text-sm text-muted-foreground">
          Crie textos, links de vídeo ou registre um PDF (somente interface).
        </p>
      </header>
      <ContentForm />
    </div>
  );
}
