import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getWebinarStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

/** Live stats endpoint, polled by the dashboard. Requires an authed session. */
export async function GET() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats = await getWebinarStats();
    return NextResponse.json(stats, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load stats";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
