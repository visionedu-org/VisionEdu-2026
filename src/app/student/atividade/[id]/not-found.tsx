import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AtividadeNotFound() {
  return (
    <div className="mx-auto max-w-lg space-y-4 p-4 text-center">
      <h1 className="text-xl font-bold">Atividade não encontrada</h1>
      <p className="text-sm text-muted-foreground">
        O link pode estar incorreto ou a atividade não está mais disponível.
      </p>
      <Link href="/student/dashboard">
        <Button className="min-h-11 w-full">Voltar ao painel</Button>
      </Link>
    </div>
  );
}
