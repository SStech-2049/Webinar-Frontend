import { createAdminClient } from "./supabase/admin";

/**
 * Shelby payout per organic registrant.
 * Derived (L3M): $79 revenue/organic-reg − commission/refunds/payroll/expenses
 * => $0.43 shelby payout per $1 => $33.65 per organic registrant.
 */
export const ORGANIC_PAYOUT_RATE = 33.65;

/** Registrants are pulled from this view, scoped by event_id. */
const VIEW = "v_all_registrants";

export type SourceBreakdown = {
  organic: number;
  paid: number;
  email: number;
  other: number;
  total: number;
};

export type WebinarEvent = {
  eventId: string;
  webinarDate: string | null; // YYYY-MM-DD
  registrants: number;
};

export type WebinarStats = {
  eventId: string | null;
  webinarDate: string | null; // YYYY-MM-DD of the selected webinar
  totalRegistrants: number;
  attendees: number;
  firstSource: SourceBreakdown;
  lastSource: SourceBreakdown;
  organicRegistrants: number; // first-source organic
  organicPayout: number; // first-source organic × rate
  organicRegistrantsLast: number; // last-source organic
  organicPayoutLast: number; // last-source organic × rate
  payoutRate: number;
  lastUpdated: string; // ISO timestamp
};

type QueryBuilder = ReturnType<
  ReturnType<typeof createAdminClient>["from"]
>["select"];

// Short cache so the dropdown counts (and which events appear) track the live
// sync without re-probing on every single request.
let eventsCache: { at: number; data: WebinarEvent[] } | null = null;
const EVENTS_TTL_MS = 30 * 1000;

/**
 * Webinars that actually have registrants, newest first.
 * Candidates come from the small webinar_events table; we probe each for a
 * registrant count in v_all_registrants (PostgREST aggregates are disabled,
 * so we can't GROUP BY) and drop events with none.
 */
export async function getWebinarEvents(force = false): Promise<WebinarEvent[]> {
  if (!force && eventsCache && Date.now() - eventsCache.at < EVENTS_TTL_MS) {
    return eventsCache.data;
  }

  const supabase = createAdminClient();

  const { data: events, error } = await supabase
    .from("webinar_events")
    .select("id, webinar_date")
    .not("webinar_date", "is", null)
    .order("webinar_date", { ascending: false });
  if (error) throw new Error(error.message);

  const probed = await Promise.all(
    (events ?? []).map(async (e) => {
      // A "registrant" is any row tied to the event in v_all_registrants.
      // (is_registrant only reflects Hyros-tag status, not whether they
      // registered, so it under-counts — we don't filter on it.)
      const { count } = await supabase
        .from(VIEW)
        .select("*", { count: "exact", head: true })
        .eq("event_id", e.id);
      return {
        eventId: e.id as string,
        webinarDate: e.webinar_date as string | null,
        registrants: count ?? 0,
      };
    })
  );

  const data = probed.filter((e) => e.registrants > 0);
  eventsCache = { at: Date.now(), data };
  return data;
}

function emptyBreakdown(): SourceBreakdown {
  return { organic: 0, paid: 0, email: 0, other: 0, total: 0 };
}

/**
 * Stats for a single webinar. Defaults to the latest webinar when no
 * eventId is supplied. Registrants are scoped by event_id.
 */
export async function getWebinarStats(eventId?: string): Promise<WebinarStats> {
  const supabase = createAdminClient();
  const events = await getWebinarEvents();

  const targetEventId = eventId ?? events[0]?.eventId ?? null;
  const webinarDate =
    events.find((e) => e.eventId === targetEventId)?.webinarDate ?? null;

  if (!targetEventId) {
    return {
      eventId: null,
      webinarDate: null,
      totalRegistrants: 0,
      attendees: 0,
      firstSource: emptyBreakdown(),
      lastSource: emptyBreakdown(),
      organicRegistrants: 0,
      organicPayout: 0,
      organicRegistrantsLast: 0,
      organicPayoutLast: 0,
      payoutRate: ORGANIC_PAYOUT_RATE,
      lastUpdated: new Date().toISOString(),
    };
  }

  // Efficient head-count queries (no rows transferred), scoped to the event.
  const count = async (
    apply: (q: ReturnType<QueryBuilder>) => ReturnType<QueryBuilder>
  ): Promise<number> => {
    const base = supabase
      .from(VIEW)
      .select("*", { count: "exact", head: true })
      .eq("event_id", targetEventId);
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
    // Every row with this event_id counts as a registrant (see note above).
    count((q) => q),
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
    eventId: targetEventId,
    webinarDate,
    totalRegistrants: total,
    attendees,
    firstSource,
    lastSource,
    organicRegistrants: firstOrganic,
    organicPayout: firstOrganic * ORGANIC_PAYOUT_RATE,
    organicRegistrantsLast: lastOrganic,
    organicPayoutLast: lastOrganic * ORGANIC_PAYOUT_RATE,
    payoutRate: ORGANIC_PAYOUT_RATE,
    lastUpdated: new Date().toISOString(),
  };
}
