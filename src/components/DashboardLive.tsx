"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { WebinarStats, WebinarEvent } from "@/lib/stats";
import { StatCard } from "./StatCard";
import { WebinarSelect } from "./WebinarSelect";

const POLL_MS = 30_000;

function fmtInt(n: number) {
  return n.toLocaleString("en-US");
}
function fmtMoney(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
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

export function DashboardLive({
  initial,
  events,
}: {
  initial: WebinarStats;
  events: WebinarEvent[];
}) {
  const [stats, setStats] = useState<WebinarStats>(initial);
  const [eventList, setEventList] = useState<WebinarEvent[]>(events);
  const [selectedEventId, setSelectedEventId] = useState<string>(
    initial.eventId ?? events[0]?.eventId ?? ""
  );
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(
    async (eventId: string) => {
      if (!eventId) return;
      setRefreshing(true);
      try {
        const res = await fetch(
          `/api/stats?eventId=${encodeURIComponent(eventId)}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: WebinarStats & { events?: WebinarEvent[] } =
          await res.json();
        setStats(data);
        if (data.events) setEventList(data.events);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Refresh failed");
      } finally {
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    timer.current = setInterval(() => refresh(selectedEventId), POLL_MS);
    const onVisible = () =>
      document.visibilityState === "visible" && refresh(selectedEventId);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      if (timer.current) clearInterval(timer.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh, selectedEventId]);

  function selectEvent(id: string) {
    setSelectedEventId(id);
    refresh(id);
  }

  const updated = new Date(stats.lastUpdated).toLocaleTimeString("en-US");

  const isLatest = eventList[0]?.eventId === selectedEventId;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Webinar selector + selected date */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-ink/50">
            Webinar
          </label>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
            <WebinarSelect
              events={eventList}
              value={selectedEventId}
              onChange={selectEvent}
              liveTotal={stats.totalRegistrants}
            />
            {!isLatest && (
              <button
                onClick={() => selectEvent(eventList[0]?.eventId ?? "")}
                className="text-xs uppercase tracking-wide text-brand-pink underline-offset-2 hover:underline"
              >
                Jump to latest
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-brand-ink/50">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-pink opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-pink" />
          </span>
          Live · updated {updated}
          <button
            onClick={() => refresh(selectedEventId)}
            disabled={refreshing}
            className="ml-2 rounded-full border border-brand-ink/20 px-3 py-0.5 text-brand-ink/70 transition hover:bg-brand-ink hover:text-white disabled:opacity-50"
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          {error && <span className="text-brand-pink">· {error}</span>}
        </div>
      </div>

      <h2 className="text-lg font-bold sm:text-xl">
        <span className="serif-italic font-normal text-brand-ink/50">
          Webinar of{" "}
        </span>
        {fmtDate(stats.webinarDate)}
      </h2>

      {/* Shelby Organic Payout — first vs. last source + registrants */}
      <section className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
        <StatCard
          label="Organic Payout · First"
          value={fmtMoney(stats.organicPayout)}
          sub={`${fmtInt(stats.organicRegistrants)} organic regs × $${stats.payoutRate.toFixed(
            2
          )}`}
          highlight
        />
        <StatCard
          label="Organic Payout · Last"
          value={fmtMoney(stats.organicPayoutLast)}
          sub={`${fmtInt(stats.organicRegistrantsLast)} organic regs × $${stats.payoutRate.toFixed(
            2
          )}`}
          accent="gold"
        />
        <StatCard
          label="Total Registrants"
          value={fmtInt(stats.totalRegistrants)}
          accent="ink"
        />
      </section>
    </div>
  );
}
