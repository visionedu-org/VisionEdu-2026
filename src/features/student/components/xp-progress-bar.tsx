interface XpProgressBarProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export function XpProgressBar({ level, xp, xpToNextLevel }: XpProgressBarProps) {
  const xpInLevel = 100 - xpToNextLevel;
  const maxInLevel = 100;

  return (
    <section aria-labelledby="xp-heading">
      <h2 id="xp-heading" className="text-lg font-semibold">
        Nível {level}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{xp} XP total</p>
      <div
        className="mt-3 h-3 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={xpInLevel}
        aria-valuemin={0}
        aria-valuemax={maxInLevel}
        aria-label={`Progresso para o nível ${level + 1}`}
      >
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${Math.min(100, (xpInLevel / maxInLevel) * 100)}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Faltam {xpToNextLevel} XP para o próximo nível
      </p>
    </section>
  );
}
