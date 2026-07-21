
# Current Feature

Admin Reservation List (Phase 3 completion, frontend half)

## Status

<!-- Not Started|In Progress|Completed -->

Completed

## Goals

<!-- Goals & requirements -->

- `/admin/reservations` — staff view of all reservations, server-rendered from
  `GET /restaurants/:id/reservations`
- Filters via query string (GET form, no client state): date, status, customer
  name/phone search
- Reservation rows show customer name + phone, date/time in the restaurant timezone,
  guests, assigned table, status pill, and the customer's note
- Status actions per row: Confirm (pending), Complete / No-show (confirmed), Cancel
  (pending/confirmed) — destructive ones behind a confirmation dialog, wired through a
  server action + `revalidatePath`
- Minimal `/admin` layout (top bar + nav), `noindex`, no login yet — the admin area is
  open until the authentication feature lands, mirroring the open API endpoints

## Notes

<!-- Any extra notes -->

- Backend counterpart lives in `booking-api` on its own `feature/admin-reservations`
  branch; see its `context/current-feature.md`
- Filters are plain GET-form query params handled server-side (empty values stripped
  before calling the API, unknown statuses ignored); `/admin` redirects to
  `/admin/reservations`
- One `ReservationActions` client component renders the valid actions per status;
  cancel and no-show share a confirmation dialog, then `revalidatePath` +
  `router.refresh()` re-render the list
- Native `<select>` styled to match the Input component — not worth adding the shadcn
  select for one field yet
- Verified in headless Chrome: confirm → complete/no-show buttons appear, dialog
  cancel → Cancelled pill, `?status=PENDING` filter — zero console errors

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
