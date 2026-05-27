import Image from "next/image";
import { ENEM_QUESTION_IMAGE_CLASSNAME } from "@/lib/enem/constants";
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
          className="prose prose-sm max-w-none text-foreground dark:prose-invert [&_img]:mx-auto [&_img]:h-auto [&_img]:max-h-44 [&_img]:w-auto [&_img]:max-w-full [&_img]:object-contain sm:[&_img]:max-h-52 md:[&_img]:max-h-60"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((src) => (
            <figure
              key={src}
              className="flex justify-center overflow-hidden rounded-lg border border-border bg-muted/20 p-2"
            >
              <Image
                src={src}
                alt="Ilustração da questão"
                width={640}
                height={400}
                className={ENEM_QUESTION_IMAGE_CLASSNAME}
                sizes="(max-width: 640px) 90vw, 640px"
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
