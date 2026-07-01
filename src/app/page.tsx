import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { getWebinarStats, getWebinarEvents } from "@/lib/stats";
import { DashboardLive } from "@/components/DashboardLive";
import { LogoutButton } from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Per-user dashboard variants.
  //  - shelby: only organic payout (first/last) + organic registrants
  //  - ally:   no payout; registrant counts + source breakdowns (also tech@)
  //  - full:   everything (default)
  const email = user.email?.toLowerCase();
  const view: "full" | "shelby" | "ally" =
    email === "shelby@shelbysapp.com"
      ? "shelby"
      : email === "ally@shelbysapp.com" || email === "tech@shelbysapp.com"
      ? "ally"
      : "full";

  const [events, stats] = await Promise.all([
    getWebinarEvents(),
    getWebinarStats(),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 flex items-start justify-between gap-3 border-b border-brand-ink/10 pb-4 sm:mb-8 sm:items-end sm:pb-5">
        <div className="min-w-0">
          <p className="serif-italic text-sm text-brand-pink sm:text-base">
            She Sells Remote
          </p>
          <h1 className="text-xl font-bold uppercase tracking-tight sm:text-3xl">
            {view === "shelby" ? "Shelby Organic Payout" : "Webinar Dashboard"}
          </h1>
          <p className="mt-0.5 truncate text-xs text-brand-ink/50 sm:mt-1 sm:text-sm">
            {user.email}
          </p>
        </div>
        <LogoutButton />
      </header>

      <DashboardLive initial={stats} events={events} view={view} />
    </main>
  );
}
