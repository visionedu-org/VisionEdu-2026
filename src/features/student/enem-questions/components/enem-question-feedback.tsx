import { CheckCircle2, XCircle } from "lucide-react";
import type { EnemQuestion, EnemQuestionAnswerRecord } from "@/types/enem";

interface EnemQuestionFeedbackProps {
  question: EnemQuestion;
  record: EnemQuestionAnswerRecord;
}

export function EnemQuestionFeedback({
  question,
  record,
}: EnemQuestionFeedbackProps) {
  const explanation = buildExplanation(question, record);

  return (
    <div
      role="status"
      className={`rounded-xl border px-4 py-3 ${
        record.isCorrect
          ? "border-emerald-600/40 bg-emerald-50 dark:bg-emerald-950/20"
          : "border-destructive/40 bg-destructive/5"
      }`}
    >
      <div className="flex items-start gap-2">
        {record.isCorrect ? (
          <CheckCircle2
            className="mt-0.5 size-5 shrink-0 text-emerald-600"
            aria-hidden
          />
        ) : (
          <XCircle
            className="mt-0.5 size-5 shrink-0 text-destructive"
            aria-hidden
          />
        )}
        <div>
          <p className="font-semibold">
            {record.isCorrect ? "Resposta correta!" : "Resposta incorreta"}
          </p>
          {!record.isCorrect && (
            <p className="mt-1 text-sm text-muted-foreground">
              Gabarito: <strong>{record.correctLetter}</strong> — você marcou{" "}
              <strong>{record.selectedLetter}</strong>
            </p>
          )}
          {explanation && (
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              {explanation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function buildExplanation(
  question: EnemQuestion,
  record: EnemQuestionAnswerRecord
): string {
  if (record.isCorrect) {
    return "Parabéns! Continue praticando questões desta área para consolidar o conteúdo.";
  }

  const skills =
    question.skills.length > 0
      ? `Revise: ${question.skills.join(", ")}.`
      : "Revise o conteúdo relacionado ao enunciado.";

  return `A alternativa correta é ${record.correctLetter}. ${skills}`;
}
