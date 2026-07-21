
# Current Feature

Reservation MVP — Web (Phase 3, frontend half)

## Status

<!-- Not Started|In Progress|Completed -->

Completed (pending commit and merge)

## Goals

<!-- Goals & requirements -->

- Port `prototype/reserve.html` into the app as `/reservations`: pick guests → pick date →
  pick an available time slot → enter details (name, phone, email, special requests) → submit
- Time slots come from the booking-api availability endpoint
  (`GET /restaurants/:id/availability?date=&guests=`); unavailable slots are never shown
- Submit creates the reservation through `POST /reservations` and redirects to the
  confirmation page
- Port `prototype/confirmation.html` as `/reservations/confirmation/[code]` — confirmation
  code, reservation details, link to the manage page
- Port `prototype/manage.html` as `/reservations/manage/[code]` — view details and cancel
  (with confirmation dialog); reschedule is deferred with the admin calendar feature
- All booking-api calls happen server-side (server components + server actions) through a
  small client in `src/lib/api.ts`; base URL from `API_URL` env var — no `NEXT_PUBLIC_` secrets
- Server actions return the `{ success, data, error }` pattern; inputs validated with Zod
- Mobile-first single-column form, large touch-friendly slot buttons, loading/disabled states,
  reusing the landing page design tokens and site layout

## Notes

<!-- Any extra notes -->

- Backend counterpart lives in `booking-api` on its own `feature/reservations` branch
  (availability engine + reservations endpoints); see its `context/current-feature.md`
- All booking-api calls stay server-side in `src/lib/api.ts` (`API_URL` +
  `RESTAURANT_SLUG` env vars with localhost fallbacks; `.env.example` added)
- `zod` installed for server-action validation; the booking form submits through
  `useActionState` → `createReservationAction`, and slot refreshes go through
  `getAvailabilityAction` inside a transition with a stale-response guard
- Added shadcn/ui `input`, `textarea`, `label`, `dialog`, `skeleton` via the CLI
  (base-nova style on @base-ui/react)
- The booking page preselects the first open day (today is skipped when closed);
  `maxGuestsOnline` and strip length still come from mock data — the API doesn't
  expose them yet
- Site chrome keeps the mock Tavola branding; the booking pages show live API data,
  so the confirmation's location box reflects whatever the DB restaurant says
- Reschedule stays deferred (admin calendar feature); manage page offers cancel only
- Turbopack quirk: JSX text that wraps to the next line after an `{expression}` loses
  its leading space — wrapped copy around expressions uses template literals instead
- Verified end-to-end in headless Chrome: book (4 guests, Saturday 17:00) →
  confirmation code → manage → cancel via dialog, with zero console errors

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
