"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { WebinarStats } from "@/lib/stats";
import { StatCard } from "./StatCard";
import { SourceBreakdownCard } from "./SourceBreakdown";

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

export function DashboardLive({ initial }: { initial: WebinarStats }) {
  const [stats, setStats] = useState<WebinarStats>(initial);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStats(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    timer.current = setInterval(refresh, POLL_MS);
    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      if (timer.current) clearInterval(timer.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  const attendRate =
    stats.totalRegistrants > 0
      ? (stats.attendees / stats.totalRegistrants) * 100
      : 0;

  const updated = new Date(stats.lastUpdated).toLocaleTimeString("en-US");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-brand-ink/50">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-pink opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-pink" />
        </span>
        Live · updated {updated}
        <button
          onClick={refresh}
          disabled={refreshing}
          className="ml-2 rounded-full border border-brand-ink/20 px-3 py-0.5 text-brand-ink/70 transition hover:bg-brand-ink hover:text-white disabled:opacity-50"
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
        {error && <span className="text-brand-pink">· {error}</span>}
      </div>

      {/* Headline payout + registrant KPIs — first vs. last source */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          label="Organic Registrants · First"
          value={fmtInt(stats.organicRegistrants)}
          sub="First source = Organic"
          accent="pink"
        />
        <StatCard
          label="Organic Registrants · Last"
          value={fmtInt(stats.organicRegistrantsLast)}
          sub="Last source = Organic"
          accent="gold"
        />
      </section>

      {/* Audience totals */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Total Registrants"
          value={fmtInt(stats.totalRegistrants)}
          accent="ink"
        />
        <StatCard
          label="Attendees"
          value={fmtInt(stats.attendees)}
          sub={`${attendRate.toFixed(1)}% of registrants`}
          accent="blue"
        />
      </section>

      {/* Source breakdowns — mirrors the Airtable Webinar Interface */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SourceBreakdownCard title="First Source" data={stats.firstSource} />
        <SourceBreakdownCard title="Last Source" data={stats.lastSource} />
      </section>
    </div>
  );
}
