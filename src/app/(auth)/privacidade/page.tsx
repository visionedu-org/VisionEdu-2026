import Link from "next/link";

export default function PrivacidadePage() {
  return (
    <article className="max-w-2xl mx-auto py-8 px-4 text-sm space-y-4">
      <h1 className="text-2xl font-bold">Política de Privacidade</h1>
      <p className="text-muted-foreground">
        Os dados tratados no MVP são fictícios ou de demonstração, em ambiente
        mock, para validação de interface. Nenhum dado é enviado a servidores
        de produção nesta fase.
      </p>
      <p className="text-muted-foreground">
        Em versões futuras, o tratamento seguirá a LGPD e fluxos de consentimento
        dos responsáveis legais.
      </p>
      <Link href="/login" className="text-primary underline">
        Voltar ao login
      </Link>
    </article>
  );
}
