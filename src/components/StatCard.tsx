export function StatCard({
  label,
  value,
  sub,
  accent = "ink",
  highlight = false,
  className = "",
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "ink" | "pink" | "blue" | "gold";
  highlight?: boolean;
  className?: string;
}) {
  const accentText: Record<string, string> = {
    ink: "text-brand-ink",
    pink: "text-brand-pink",
    blue: "text-brand-blue",
    gold: "text-brand-gold",
  };

  if (highlight) {
    // Headline card — dark "editorial" block like the brand's dark sections.
    return (
      <div className={`rounded-2xl bg-brand-ink p-4 shadow-lg sm:p-5 ${className}`}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60 sm:text-[11px] sm:tracking-[0.18em]">
          {label}
        </p>
        <p className="mt-1.5 text-2xl font-bold leading-tight tracking-tight text-brand-pink tabular-nums sm:mt-2 sm:text-4xl">
          {value}
        </p>
        {sub && (
          <p className="serif-italic mt-1 text-xs text-white/70 sm:mt-1.5 sm:text-sm">
            {sub}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-brand-ink/10 bg-white p-4 shadow-sm sm:p-5 ${className}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-ink/50 sm:text-[11px] sm:tracking-[0.18em]">
        {label}
      </p>
      <p
        className={`mt-1.5 text-2xl font-bold leading-tight tracking-tight tabular-nums sm:mt-2 sm:text-3xl ${accentText[accent]}`}
      >
        {value}
      </p>
      {sub && (
        <p className="serif-italic mt-1 text-xs text-brand-ink/50 sm:text-sm">
          {sub}
        </p>
      )}
    </div>
  );
}
