# Current Feature

Public reservation lookup by phone number: customers can find their upcoming
bookings on `/reservations/manage` with the phone number they booked with,
instead of needing the confirmation code (spec B "Reservations" / C manage
flow; the admin list already searched phone via `b0c568d`)

## Status

Completed — pending commit. Spans two repos: booking-api (lookup endpoint) and
bookingapp (this repo: manage page + form)

## Goals

- **Backend** — `GET /reservations/lookup?phone=` (declared before
  `GET /reservations/:confirmationCode` so "lookup" is not matched as a code):
  new `LookupReservationsQueryDto` reusing the booking phone regex (400 on
  invalid/missing), `findUpcomingByPhone` in `ReservationsService` returning
  the public payload (`internalNotes` omitted) ordered by `startAt`. Privacy
  scope: exact-match on the trimmed phone string (the same identity rule as
  `upsertCustomer`), and only bookings that still hold a table
  (`PENDING`/`CONFIRMED` via `BLOCKING_STATUSES`) and haven't ended
  (`endAt > now`) — cancelled/past history is never exposed, and an unknown
  phone answers an empty `200` list, not a 404. Two unit tests added
- **Frontend** — `lookupReservationsByPhone` in `src/lib/api.ts`.
  `LookupForm` gains a "Booking code | Phone number" `aria-pressed` toggle
  (DateStrip chip styling); phone mode navigates to
  `/reservations/manage?phone=…`. The manage page (now dynamic, reading
  `searchParams`) validates the phone against the same regex, fetches
  server-side and renders result cards — date, time range, guest count,
  status pill, mono code, "View or cancel" link to `/reservations/manage/
  [code]` — plus empty/invalid/API-down states. Arriving with `?phone=`
  preselects phone mode with the number prefilled; the `[code]` page keeps
  using the form in code mode

## Notes

- Verified against the live API (production build on :3002 → API on :3001,
  seeded data): active phone lists its confirmed booking with correct
  Riyadh-rendered date/time and working manage link; cancelled-only and
  unknown phones hit the empty state; malformed phone shows the validation
  message without calling the API; missing/invalid phone 400s at the API;
  `internalNotes` absent from the payload; `[code]` lookup unaffected.
  `npm run lint`, both builds and the 53 backend jest tests clean. Read-only
  verification — no data to restore
- The user-started dev server on :3000 currently fails all API-backed pages
  (including pre-existing ones) — its process env predates the API moving back
  to :3001; a restart will pick up `.env.local`. Untouched, as before
- Phone matching is exact on the stored string ("055 123 4567" typed later
  won't find "0551234567") — consistent with the customer-identity rule at
  booking time; normalization would need to change both sides together
- Rate limiting on the public endpoints (incl. this one) stays a Phase 7 item
- Working directly on `main` in both repos, matching the last several features

## Previous Feature

Phase 5 — Menu: public menu browsing (`/menu`, `/menu/[category]` with search
+ chips), homepage featured dishes over the live endpoint, `/admin/menu`
management (dishes + categories, availability/featured toggles, 409-aware
deletes), menu types/client/actions with `MENU_TAG` revalidation, image URLs
via `unoptimized` `next/image` with fallback (spec H "Restaurant Menu") —
Completed, committed to `main` as `29583e3` (booking-api: migration
`20260723225650_extend_menu_models`, `src/menu/` module and seed as `55ff993`)

## History

<!-- Keep this updated. Earliest to latest -->

- `52fd12c` (2026-07-19) Project setup — initial commit from Create Next App
- `25716d2` (2026-07-19) Frontend setup: src/ restructure, boilerplate cleanup, metadata,
  removed unused public/ SVGs
- `327fee9` (2026-07-20) Added the coding standards document to `context/`
- `c2220f9` (2026-07-20) Documented the class-name merge helpers in `src/lib/utils.ts`
- `00ed218` (2026-07-21) Static UI/UX prototype: public site + admin panel in plain
  HTML/CSS/JS, on `feature/ui-prototype`; merged to `main` 2026-07-21
- `da7e09b` (2026-07-21) Landing page ported from the prototype to Next.js + shadcn/ui:
  Tavola design tokens in globals.css, `(site)` route group with header/footer, typed
  mock data, dark default + light toggle, on `feature/landing-page`
- `b6c3a65` (2026-07-21) Reservation MVP frontend: booking flow (guests → date →
  slots → details), confirmation and manage/cancel pages wired to booking-api via
  server actions, on `feature/reservations`; merged to `main` 2026-07-21
- `a5cb10d` (2026-07-21) Staff reservation list: /admin layout + /admin/reservations
  with date/status/search filters and confirm/complete/no-show/cancel actions, on
  `feature/admin-reservations`; merged to `main` 2026-07-21
- `8b56dfd` (2026-07-21) Fix: "Already have a booking?" manage/cancel link added to the booking page header, on `fix/reservations-manage-link`; merged to `main` 2026-07-21
- `df01878` (2026-07-21) Fix: manage-booking link restyled as an outline CTA beside the booking page title, on `fix/manage-booking-cta`; merged to `main` 2026-07-21
- `97d0c08` (2026-07-22) SiteHeader server/client split (MobileNav + NavLink extracted,
  API-sourced brand name with build-time SSG), on `refactor/site-header-server-split`;
  merged to `main` 2026-07-22
- `9b27e42` (2026-07-22) Refactor: `DayOfWeek` type usage in the date and restaurant
  modules
- `f07cf3e` (2026-07-22) Fix: reservation email made optional and phone validation
  aligned with the API (backend counterpart pending commit in booking-api)
- `0ea7d85` (2026-07-23) Admin booking calendar: /admin/calendar day/week time-grid
  with status/table/search filters, reservation details dialog (reused on
  /admin/reservations) with reschedule via SlotGrid and table assignment, on
  `feature/admin-calendar`; merged to `main` 2026-07-23
- `1d779e6` (2026-07-23) Admin dashboard: /admin stat grid, today's service timeline,
  pending requests, peak times and upcoming reservations, plus the Dashboard nav
  link; committed directly to `main`
- `b94f14b` (2026-07-23) Admin sidebar navigation: persistent sidebar from `lg` up,
  slide-in drawer below with scrim/Escape/nav close, AdminShell + AdminNav client
  split; committed directly to `main`
- `b0c568d` (2026-07-23) Admin reservation search by booking number: widened the
  `/admin/reservations` search to also match `confirmationCode` (case-insensitive)
  and relabelled the field to "Name, phone, or booking #"; committed directly to
  `main` (booking-api search query committed in its own repo)
- `af74e6e` (2026-07-23) Prevent no-show / complete for future reservations:
  server-decided `hasStarted` gates the buttons, backend 409 guards in
  booking-api `9575fdf`; committed directly to `main`
- `29583e3` (2026-07-23) Phase 5 menu: public menu + featured dishes + /admin/menu
  management; committed directly to `main` (booking-api menu module `55ff993`)
