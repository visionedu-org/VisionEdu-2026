import Link from "next/link";

interface LegalConsentBlockProps {
  showMinorNotice?: boolean;
  showLei15100?: boolean;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
}

export function LegalConsentBlock({
  showMinorNotice = false,
  showLei15100 = false,
  checked,
  onCheckedChange,
  error,
}: LegalConsentBlockProps) {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
      {showMinorNotice && (
        <p>
          Você declara ser estudante menor de idade e que o uso da plataforma
          está autorizado pela escola ou pelo responsável legal, conforme sua
          matrícula no piloto CETI.
        </p>
      )}
      {showLei15100 && (
        <p>
          O VisionEdu é destinado ao <strong>uso pedagógico supervisionado</strong>{" "}
          em ambiente escolar, em conformidade com a Lei Federal 15.100/2025.{" "}
          <Link href="/termos" className="text-primary underline underline-offset-2">
            Saiba mais
          </Link>
        </p>
      )}
      <label className="flex min-h-11 cursor-pointer items-start gap-3 text-foreground">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="mt-1 size-4 shrink-0 rounded border-input"
          aria-invalid={!!error}
        />
        <span>
          Li e aceito os{" "}
          <Link href="/termos" className="text-primary underline underline-offset-2">
            Termos de Uso
          </Link>{" "}
          e a{" "}
          <Link
            href="/privacidade"
            className="text-primary underline underline-offset-2"
          >
            Política de Privacidade
          </Link>
          .
        </span>
      </label>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
