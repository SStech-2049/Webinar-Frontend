"use client";

import { useEffect, useRef, useState } from "react";
import type { WebinarEvent } from "@/lib/stats";

function fmtInt(n: number) {
  return n.toLocaleString("en-US");
}
function fmtDate(d: string | null) {
  if (!d) return "—";
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function WebinarSelect({
  events,
  value,
  onChange,
  liveTotal,
}: {
  events: WebinarEvent[];
  value: string;
  onChange: (eventId: string) => void;
  /** Live registrant total for the selected event (keeps the label fresh). */
  liveTotal: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = events.find((e) => e.eventId === value);
  const selectedRegs = selected
    ? value === selected.eventId
      ? liveTotal
      : selected.registrants
    : 0;

  return (
    <div ref={ref} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-3 rounded-full border bg-white px-4 py-2 text-sm font-medium text-brand-ink transition sm:w-[280px] ${
          open
            ? "border-brand-pink ring-2 ring-brand-pink/20"
            : "border-brand-ink/20 hover:border-brand-ink/40"
        }`}
      >
        <span className="truncate">
          {fmtDate(selected?.webinarDate ?? null)}
          <span className="ml-1.5 text-brand-ink/45">
            · {fmtInt(selectedRegs)} regs
          </span>
        </span>
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className={`h-4 w-4 shrink-0 text-brand-ink/50 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <path
            d="M5 7.5 10 12.5 15 7.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 z-30 mt-2 max-h-80 w-full overflow-auto rounded-2xl border border-brand-ink/10 bg-white p-1.5 shadow-xl sm:w-[300px]"
        >
          {events.map((ev, i) => {
            const isSelected = ev.eventId === value;
            const regs = isSelected ? liveTotal : ev.registrants;
            return (
              <button
                key={ev.eventId}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(ev.eventId);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                  isSelected
                    ? "bg-brand-pink/10 text-brand-ink"
                    : "text-brand-ink/80 hover:bg-brand-cream"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-medium">
                    {fmtDate(ev.webinarDate)}
                  </span>
                  {i === 0 && (
                    <span className="shrink-0 rounded-full bg-brand-pink px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                      Latest
                    </span>
                  )}
                </span>
                <span className="shrink-0 tabular-nums text-xs text-brand-ink/45">
                  {fmtInt(regs)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
