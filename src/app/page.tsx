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

  const [events, stats] = await Promise.all([
    getWebinarEvents(),
    getWebinarStats(),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex items-end justify-between border-b border-brand-ink/10 pb-5">
        <div>
          <p className="serif-italic text-base text-brand-pink">She Sells Remote</p>
          <h1 className="text-3xl font-bold uppercase tracking-tight">
            Webinar Dashboard
          </h1>
          <p className="mt-1 text-sm text-brand-ink/50">{user.email}</p>
        </div>
        <LogoutButton />
      </header>

      <DashboardLive initial={stats} events={events} />
    </main>
  );
}
