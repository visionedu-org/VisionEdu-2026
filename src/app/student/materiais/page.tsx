import { AppPage } from "@/components/layout/app-page";
import { StudentMaterialsList } from "@/features/student/components/student-materials-list";

export default function StudentMateriaisPage() {
  return (
    <AppPage>
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Materiais</h1>
        <p className="text-sm text-muted-foreground">
          Conteúdos enviados pelos seus professores para a sua turma.
        </p>
      </header>
      <StudentMaterialsList />
    </AppPage>
  );
}
