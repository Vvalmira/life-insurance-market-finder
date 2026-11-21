interface ScoreRingProps {
  score: number | null;
  size?: "small" | "large";
}

export function ScoreRing({ score, size = "small" }: ScoreRingProps) {
  const safeScore = score ?? 0;
  return (
    <div
      className={`score-ring score-ring--${size}`}
      style={{ "--score": `${safeScore * 3.6}deg` } as React.CSSProperties}
      aria-label={
        score === null
          ? "Not ranked"
          : `Opportunity score ${score.toFixed(1)} out of 100`
      }
    >
      <span>{score === null ? "—" : score.toFixed(1)}</span>
    </div>
  );
}
