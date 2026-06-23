# Webinar Dashboard

Live dashboard for the **current webinar**, reading the Supabase view `v_current_webinar`.

## Metrics

- **Organic Payout** — first-source-organic registrants × **$33.65** (Shelby payout per organic registrant).
- **Organic Registrants** — registrants whose Hyros **first source = Organic**.
- **Total Registrants** and **Attendees** (+ attendance rate).
- **First Source** and **Last Source** breakdowns (Organic / Paid / Email / Other) — mirrors the Airtable "Webinar Interface".

Data refreshes live (polls every 30s, plus on tab focus and a manual Refresh button).

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start   # production
```

Requires `.env.local` (already present) with `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Auth

Email + password login (`signInWithPassword`) against existing Supabase Auth
users. The session is stored in cookies and enforced by `middleware.ts`.
Make sure each user has a password set in **Supabase → Auth → Users** (use
"Send password recovery" / set a password if a user was created without one).
Email/password sign-in must be enabled under **Auth → Providers → Email**.

## Architecture

- `src/lib/stats.ts` — aggregation (parallel `head:true` count queries) + payout math.
- `src/lib/supabase/admin.ts` — service-role client (server-only, reads the view).
- `src/lib/supabase/{server,client}.ts` + `middleware.ts` — auth session / route gate.
- `src/app/api/stats/route.ts` — auth-protected live stats endpoint.
- `src/app/page.tsx` + `src/components/DashboardLive.tsx` — server render + client polling.
