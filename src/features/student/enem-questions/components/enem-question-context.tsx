import Image from "next/image";
import { formatEnemMarkdown } from "@/lib/enem/markdown";

interface EnemQuestionContextProps {
  context: string | null;
  files: string[];
  introduction?: string | null;
}

export function EnemQuestionContext({
  context,
  files,
  introduction,
}: EnemQuestionContextProps) {
  const html = formatEnemMarkdown(context);

  return (
    <div className="space-y-4">
      {html && (
        <div
          className="prose prose-sm max-w-none text-foreground dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((src) => (
            <figure
              key={src}
              className="overflow-hidden rounded-lg border border-border bg-muted/20"
            >
              <Image
                src={src}
                alt="Ilustração da questão"
                width={800}
                height={500}
                className="h-auto w-full object-contain"
                sizes="(max-width: 512px) 100vw, 512px"
                unoptimized
              />
            </figure>
          ))}
        </div>
      )}

      {introduction?.trim() && (
        <p className="text-sm font-medium text-muted-foreground">
          {introduction}
        </p>
      )}
    </div>
  );
}
