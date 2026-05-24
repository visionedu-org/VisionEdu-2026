import { StudentMaterialsList } from "@/features/student/components/student-materials-list";

export default function StudentMateriaisPage() {
  return (
    <div className="mx-auto w-full max-w-lg space-y-4 overflow-x-hidden p-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Materiais</h1>
        <p className="text-sm text-muted-foreground">
          Conteúdos enviados pelos seus professores para a sua turma.
        </p>
      </header>
      <StudentMaterialsList />
    </div>
  );
}
