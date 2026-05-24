import Link from "next/link";
import { MaterialsList } from "@/features/teacher/components/materials-list";
import { Button } from "@/components/ui/button";

export default function TeacherMateriaisPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Materiais enviados</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe os conteúdos que você enviou para suas turmas.
          </p>
        </div>
        <Link href="/teacher/conteudos/novo" className="shrink-0">
          <Button className="min-h-11 w-full sm:w-auto">Novo material</Button>
        </Link>
      </header>

      <MaterialsList />
    </div>
  );
}
