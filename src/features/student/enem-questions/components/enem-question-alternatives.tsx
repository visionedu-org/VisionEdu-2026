import Image from "next/image";
import { ENEM_QUESTION_IMAGE_CLASSNAME } from "@/lib/enem/constants";
import type { EnemAlternative, EnemAlternativeLetter } from "@/types/enem";
import { cn } from "@/lib/utils";

interface EnemQuestionAlternativesProps {
  alternatives: EnemAlternative[];
  selected: EnemAlternativeLetter | null;
  disabled?: boolean;
  reveal?: boolean;
  onSelect: (letter: EnemAlternativeLetter) => void;
}

export function EnemQuestionAlternatives({
  alternatives,
  selected,
  disabled,
  reveal,
  onSelect,
}: EnemQuestionAlternativesProps) {
  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="sr-only">Alternativas</legend>
      {alternatives.map((alt) => {
        const isSelected = selected === alt.letter;
        const isCorrect = alt.isCorrect;
        const showState = reveal && (isCorrect || isSelected);

        return (
          <label
            key={alt.letter}
            className={cn(
              "flex min-h-11 cursor-pointer flex-col gap-2 rounded-lg border border-border px-3 py-3 transition-colors",
              isSelected && !reveal && "border-primary bg-primary/5",
              showState &&
                isCorrect &&
                "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
              showState &&
                isSelected &&
                !isCorrect &&
                "border-destructive bg-destructive/5"
            )}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="enem-alternative"
                value={alt.letter}
                checked={isSelected}
                disabled={disabled}
                onChange={() => onSelect(alt.letter)}
                className="mt-1 size-4 shrink-0"
              />
              <span className="text-sm font-semibold">{alt.letter}</span>
              {alt.text && (
                <span className="flex-1 text-sm leading-relaxed">{alt.text}</span>
              )}
            </div>
            {alt.file && (
              <div className="ml-7 flex justify-start">
                <Image
                  src={alt.file}
                  alt={`Ilustração da alternativa ${alt.letter}`}
                  width={640}
                  height={400}
                  className={cn(ENEM_QUESTION_IMAGE_CLASSNAME, "rounded-md")}
                  sizes="(max-width: 640px) 90vw, 640px"
                  unoptimized
                />
              </div>
            )}
          </label>
        );
      })}
    </fieldset>
  );
}
