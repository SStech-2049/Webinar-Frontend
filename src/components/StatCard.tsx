export function StatCard({
  label,
  value,
  sub,
  accent = "ink",
  highlight = false,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "ink" | "pink" | "blue" | "gold";
  highlight?: boolean;
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
      <div className="rounded-2xl bg-brand-ink p-5 shadow-lg">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
          {label}
        </p>
        <p className="mt-2 text-4xl font-bold text-brand-pink">{value}</p>
        {sub && <p className="serif-italic mt-1.5 text-sm text-white/70">{sub}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-ink/10 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-ink/50">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-bold ${accentText[accent]}`}>{value}</p>
      {sub && <p className="serif-italic mt-1 text-sm text-brand-ink/50">{sub}</p>}
    </div>
  );
}
