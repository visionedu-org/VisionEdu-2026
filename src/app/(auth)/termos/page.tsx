import Link from "next/link";

export default function TermosPage() {
  return (
    <article className="max-w-2xl mx-auto py-8 px-4 prose prose-slate dark:prose-invert text-sm">
      <h1 className="text-2xl font-bold mb-4">Termos de Uso — VisionEdu</h1>
      <p>
        A plataforma VisionEdu é oferecida pela Secretaria da Educação do Estado
        do Piauí para apoio pedagógico no âmbito do piloto escolar. O uso deve
        ocorrer com supervisão docente e finalidade educacional.
      </p>
      <p>
        Ao utilizar o serviço, você concorda em fornecer dados verídicos e
        respeitar as normas da instituição de ensino vinculada.
      </p>
      <Link href="/login" className="text-primary underline">
        Voltar ao login
      </Link>
    </article>
  );
}
