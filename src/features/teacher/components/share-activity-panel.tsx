"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";

interface ShareActivityPanelProps {
  activityId: string;
  title: string;
}

export function ShareActivityPanel({ activityId, title }: ShareActivityPanelProps) {
  const [origin] = useState(
    () => (typeof window !== "undefined" ? window.location.origin : ""),
  );
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState("");

  const shareUrl =
    origin.length > 0
      ? `${origin}/student/atividade/${activityId}`
      : `/student/atividade/${activityId}`;
  const codeUrl =
    origin.length > 0
      ? `${origin}/student/entrar?code=${activityId}`
      : `/student/entrar?code=${activityId}`;

  useEffect(() => {
    if (!origin) return;
    let cancelled = false;
    QRCode.toDataURL(shareUrl, { width: 240, margin: 2 })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [origin, shareUrl]);

  const copyLink = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus("Link copiado");
    } catch {
      setCopyStatus("Não foi possível copiar. Selecione o link manualmente.");
    }
  }, [shareUrl]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Compartilhar atividade</p>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">
          Projete esta tela na sala ou envie o link para os alunos abrirem no
          celular após o login.
        </p>
      </header>

      <section
        className="rounded-xl border border-border bg-card p-6 shadow-sm"
        aria-labelledby="share-link-heading"
      >
        <h2 id="share-link-heading" className="text-lg font-medium">
          Link da atividade
        </h2>
        <p className="mt-2 break-all font-mono text-sm text-muted-foreground">
          {shareUrl}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" className="min-h-11" onClick={() => void copyLink()}>
            Copiar link
          </Button>
          <span role="status" aria-live="polite" className="sr-only">
            {copyStatus}
          </span>
          {copyStatus ? (
            <p className="self-center text-sm text-foreground" aria-hidden="true">
              {copyStatus}
            </p>
          ) : null}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Alternativa com código:{" "}
          <Link href={codeUrl} className="text-primary underline-offset-4 hover:underline">
            {codeUrl}
          </Link>
        </p>
      </section>

      <section
        className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-start"
        aria-labelledby="share-qr-heading"
      >
        <div className="flex-1 space-y-2">
          <h2 id="share-qr-heading" className="text-lg font-medium">
            QR Code
          </h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Peça aos alunos para abrirem a câmera ou um leitor de QR.</li>
            <li>Escaneiem o código para abrir a atividade no navegador.</li>
            <li>
              Se ainda não estiverem logados, façam login com a conta de demonstração
              de aluno.
            </li>
            <li>Na tela da atividade, respondam as questões e enviem ao final.</li>
          </ol>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-2">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URL from qrcode
            <img
              src={qrDataUrl}
              width={240}
              height={240}
              alt="QR Code para abrir atividade no celular do aluno"
              className="rounded-lg border border-border bg-white p-2"
            />
          ) : (
            <div
              className="flex h-60 w-60 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground"
              aria-busy={origin.length > 0}
            >
              {origin ? "Gerando QR Code…" : "Carregando…"}
            </div>
          )}
        </div>
      </section>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/teacher/diagnosticos/novo" className="text-primary hover:underline">
          Criar outro diagnóstico
        </Link>
        {" · "}
        <Link href="/teacher/dashboard" className="text-primary hover:underline">
          Voltar ao painel
        </Link>
      </p>
    </div>
  );
}
