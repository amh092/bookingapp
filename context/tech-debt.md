# Tech Debt

Known gaps and deferred improvements, to be finalized later. Newest first.
Remove items when done and note the commit.

## Next.js 16 review of the admin pages (2026-07-23)

Found while reviewing `src/app/admin/calendar/page.tsx` against the v16.2.9 docs;
most items apply to `/admin/reservations` too.

1. **Filter forms do a full-page reload** — `<form method="get">` on the
   calendar and reservations pages is an MPA submit (full document teardown,
   re-hydration, scroll reset). Swap for `next/form`'s
   `<Form action="/admin/...">`, which encodes fields as search params but
   navigates client-side. Hidden inputs keep working. *High value, small.*
2. **No `loading.tsx` for `/admin/calendar` or `/admin/reservations`** — the
   pages are dynamic + `no-store`, so prev/next/filter navigation gives zero
   feedback until both API calls round-trip. Add skeleton loading files (the
   `Skeleton` component exists); also makes `<Link>` prefetch of the loading
   boundary useful. *High value, small.*
3. **Hand-rolled page prop types** — replace the manual
   `{ searchParams: Promise<Record<...>> }` with Next 16's generated
   `PageProps<'/admin/calendar'>` helper. *Two-line cleanup.*
4. **`'use cache'` + `cacheComponents` for the stable data** — restaurant
   profile + tables fetches could be cached components with
   `cacheTag`/`cacheLife` (fits the force-cache-plus-tags approach used for the
   site header) while the reservations grid stays runtime-dynamic behind
   `Suspense`. Deferred until the admin settings/tables features exist to call
   the tag revalidation; note `new Date()` usage must stay in the dynamic part.
5. **Polish** — `scroll={false}` on calendar prev/next/view-toggle links;
   `generateMetadata` with the visible date range in the tab title.

## Previously noted (2026-07-21 → 07-23)

- **Mock branding still used in page titles/meta and the footer** — the header
  brand name comes from the API, but `RESTAURANT` from `src/lib/mock-data.ts`
  still feeds `metadata` on every page and `SiteFooter`.
- **Admin area has no authentication** — open + `noindex` by design until the
  auth feature lands; every admin API endpoint is open to match. The auth
  feature guards both at once (JWT + role-based access per the spec).
- **Confirmation-code search not supported** — the admin list/calendar search
  matches customer name/phone only; add `confirmationCode` to the backend
  search OR-clause if staff need code lookup.
- **booking-api holds the uncommitted counterpart of frontend `f07cf3e`**
  (optional email + phone validation in the create-reservation DTO/service) —
  riding along on `feature/admin-calendar`; commit it separately or first.
- **Frontend unit tests deferred** (per `ai-interaction.md` workflow) — booking
  form validation, slot selection, and admin filter rendering are
  browser-verified only; backend has the Jest suite.
