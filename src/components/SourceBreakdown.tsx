import type { SourceBreakdown as Breakdown } from "@/lib/stats";

const ROWS = [
  { key: "organic", label: "Organic", bar: "bg-brand-pink", text: "text-brand-pink" },
  { key: "email", label: "Email", bar: "bg-brand-gold", text: "text-brand-gold" },
  { key: "paid", label: "Paid", bar: "bg-brand-blue", text: "text-brand-blue" },
] as const;

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

export function SourceBreakdownCard({
  title,
  data,
}: {
  title: string;
  data: Breakdown;
}) {
  const total = data.total || 1;

  return (
    <div className="rounded-2xl border border-brand-ink/10 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink/70">
        {title}
      </h3>
      <div className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
        {ROWS.map((row) => {
          const value = data[row.key];
          const pct = (value / total) * 100;
          return (
            <div key={row.key}>
              <div className="flex items-center justify-between text-sm">
                <span className={`font-medium ${row.text}`}>{row.label}</span>
                <span className="tabular-nums text-brand-ink/80">
                  {fmt(value)}{" "}
                  <span className="text-brand-ink/40">({pct.toFixed(1)}%)</span>
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-brand-ink/5">
                <div
                  className={`h-full rounded-full ${row.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
