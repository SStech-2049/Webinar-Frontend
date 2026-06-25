import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getWebinarStats, getWebinarEvents } from "@/lib/stats";

export const dynamic = "force-dynamic";

/** Live stats endpoint, polled by the dashboard. Requires an authed session. */
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const eventId = request.nextUrl.searchParams.get("eventId") ?? undefined;
    // Return the (cheaply cached) events list too so the dropdown self-heals
    // as the underlying data syncs, without needing a full page reload.
    const [stats, events] = await Promise.all([
      getWebinarStats(eventId),
      getWebinarEvents(),
    ]);
    return NextResponse.json(
      { ...stats, events },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load stats";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
