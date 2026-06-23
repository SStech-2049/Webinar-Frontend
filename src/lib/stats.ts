import { createAdminClient } from "./supabase/admin";

/**
 * Shelby payout per organic registrant.
 * Derived (L3M): $79 revenue/organic-reg − commission/refunds/payroll/expenses
 * => $0.43 shelby payout per $1 => $33.65 per organic registrant.
 */
export const ORGANIC_PAYOUT_RATE = 33.65;

/** "Organic" for the payout = Hyros FIRST-source attribution. */
const VIEW = "v_current_webinar";

export type SourceBreakdown = {
  organic: number;
  paid: number;
  email: number;
  other: number;
  total: number;
};

export type WebinarStats = {
  totalRegistrants: number;
  attendees: number;
  firstSource: SourceBreakdown;
  lastSource: SourceBreakdown;
  organicRegistrants: number; // first-source organic
  organicPayout: number;
  payoutRate: number;
  lastUpdated: string; // ISO timestamp
};

type QueryBuilder = ReturnType<
  ReturnType<typeof createAdminClient>["from"]
>["select"];

export async function getWebinarStats(): Promise<WebinarStats> {
  const supabase = createAdminClient();

  // Efficient head-count queries (no rows transferred), run in parallel.
  const count = async (
    apply: (q: ReturnType<QueryBuilder>) => ReturnType<QueryBuilder>
  ): Promise<number> => {
    const base = supabase.from(VIEW).select("*", { count: "exact", head: true });
    const { count: c, error } = await apply(base);
    if (error) throw new Error(error.message);
    return c ?? 0;
  };

  const [
    total,
    attendees,
    firstOrganic,
    firstPaid,
    firstEmail,
    lastOrganic,
    lastPaid,
    lastEmail,
  ] = await Promise.all([
    count((q) => q.eq("is_registrant", true)),
    count((q) => q.eq("is_attendee", true)),
    count((q) => q.eq("traffic_first_source", "Organic")),
    count((q) => q.eq("traffic_first_source", "Paid")),
    count((q) => q.eq("traffic_first_source", "Email")),
    count((q) => q.eq("traffic_last_source", "Organic")),
    count((q) => q.eq("traffic_last_source", "Paid")),
    count((q) => q.eq("traffic_last_source", "Email")),
  ]);

  const firstSource: SourceBreakdown = {
    organic: firstOrganic,
    paid: firstPaid,
    email: firstEmail,
    other: Math.max(0, total - firstOrganic - firstPaid - firstEmail),
    total,
  };

  const lastSource: SourceBreakdown = {
    organic: lastOrganic,
    paid: lastPaid,
    email: lastEmail,
    other: Math.max(0, total - lastOrganic - lastPaid - lastEmail),
    total,
  };

  return {
    totalRegistrants: total,
    attendees,
    firstSource,
    lastSource,
    organicRegistrants: firstOrganic,
    organicPayout: firstOrganic * ORGANIC_PAYOUT_RATE,
    payoutRate: ORGANIC_PAYOUT_RATE,
    lastUpdated: new Date().toISOString(),
  };
}
