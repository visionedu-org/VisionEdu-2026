"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { enemQuestionsService } from "@/services/enem-questions.service";
import type {
  EnemQuestion,
  EnemQuestionAnswerRecord,
} from "@/types/enem";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EnemAiResolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: EnemQuestion;
  record: EnemQuestionAnswerRecord;
}

type ResolutionState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; explanation: string }
  | { status: "error"; message: string };

export function EnemAiResolutionDialog({
  open,
  onOpenChange,
  question,
  record,
}: EnemAiResolutionDialogProps) {
  const [state, setState] = useState<ResolutionState>({ status: "idle" });

  useEffect(() => {
    if (!open) {
      setState({ status: "idle" });
    }
  }, [open, question.year, question.index, record.selectedLetter]);

  async function handleGenerateResolution() {
    if (state.status === "loading") return;

    setState({ status: "loading" });

    try {
      const result = await enemQuestionsService.generateAiResolution({
        year: question.year,
        index: question.index,
        language: question.language,
        selectedLetter: record.selectedLetter,
      });
      setState({ status: "success", explanation: result.explanation });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Não foi possível gerar a resolução. Tente novamente.";
      setState({ status: "error", message });
    }
  }

  const isLoading = state.status === "loading";
  const hasExplanation = state.status === "success";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[60] max-h-[min(90vh,32rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-8">
            <Sparkles className="size-5 shrink-0 text-primary" aria-hidden />
            Resolução com IA
          </DialogTitle>
        </DialogHeader>

        {!hasExplanation && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Você pode pedir uma resolução comentada desta questão para a nossa
            inteligência artificial. Ela explicará o raciocínio passo a passo,
            ajudando você a entender o gabarito e revisar o conteúdo do enunciado.
          </p>
        )}

        {state.status === "error" && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {state.message}
          </p>
        )}

        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Spinner size="lg" label="Gerando resolução com IA" />
            <p className="text-center text-sm text-muted-foreground">
              A IA está analisando a questão. Isso pode levar alguns segundos…
            </p>
          </div>
        )}

        {hasExplanation && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Explicação da resolução
            </p>
            <div className="max-h-[min(50vh,20rem)] overflow-y-auto rounded-xl border border-border bg-muted/30 px-4 py-3">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {state.explanation}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {!hasExplanation && (
            <Button
              type="button"
              className="min-h-11 w-full"
              disabled={isLoading}
              onClick={() => void handleGenerateResolution()}
            >
              {isLoading ? (
                "Gerando…"
              ) : (
                <>
                  <Sparkles className="size-4" aria-hidden />
                  Gerar resolução com IA
                </>
              )}
            </Button>
          )}
          {hasExplanation && (
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full"
              onClick={() => void handleGenerateResolution()}
              disabled={isLoading}
            >
              Gerar novamente
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
