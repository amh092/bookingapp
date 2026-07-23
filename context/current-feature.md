
# Current Feature

Admin Dashboard (MVP item; spec "Dashboard Metrics", reservation-only subset)

## Status

<!-- Not Started|In Progress|Completed -->

In Progress

## Goals

<!-- Goals & requirements -->

- `/admin` becomes the dashboard page (it currently just redirects to
  `/admin/reservations`); a "Dashboard" link is added to the admin nav
  (`NavLink` matches the exact path, so it only highlights on `/admin`)
- Layout follows `prototype/admin/dashboard.html`, minus the panels that need
  the orders/menu modules (Orders today, Revenue today, Popular this week) —
  those come back with the ordering phase
- Stat grid (today, in the restaurant's timezone): reservations, confirmed,
  pending, cancelled, guests expected (non-cancelled/non-no-show, with total
  active seats as context), plus a 30-day no-show rate
  (`NO_SHOW / (NO_SHOW + COMPLETED)`, an em dash when there are no finished
  bookings yet)
- "Today's service" timeline: today's non-cancelled bookings by time; each
  opens the existing `ReservationDetailsDialog`; "Open calendar" links to
  `/admin/calendar`
- "Pending requests" panel: all PENDING bookings (any date) with a count pill;
  the first few cards reuse `ReservationActions` for confirm/decline
- "Peak times" bar list: today's guest counts bucketed by hour
- "Upcoming reservations" list: the next 8 active (pending/confirmed) bookings
  within the coming week, each opening the details dialog; "View all" links to
  `/admin/reservations`
- Server-rendered, no new client components — reuses `ReservationDetailsDialog`,
  `ReservationActions`, and `StatusPill`
- Data comes from the existing endpoints only (no backend changes): parallel
  admin-list calls for today / all-pending / next-7-days / past-30-days plus
  the tables list. Fine at this data size; a dedicated stats endpoint is a
  possible later optimization

## Notes

- Implemented directly on `main` (Ahmed's call — no feature branch this time)
- Verified in headless Chrome against the live API at 1280px and 390px: all six
  stats render with consistent numbers, timeline/pending/upcoming open the
  details dialog, Dashboard nav link active state, zero console errors, no
  horizontal overflow
- Adding the third nav link overflowed the admin header at 390px; fixed by
  hiding the "· Staff" brand suffix below `sm` and letting the nav scroll
  horizontally (`overflow-x-auto`) — the proper mobile drawer stays a
  later feature per the spec
- `Date.now()` in a server component trips the `react-hooks/purity` lint rule;
  the page takes one `new Date()` alongside the today-key computation and
  derives "now" from it
- The two PENDING test bookings got confirmed mid-verification (live Confirm
  clicks in the browser), so the dev DB now has no pending bookings — the
  pending panel shows its "All caught up 🎉" empty state

## Previous Feature

Admin Booking Calendar (Phase 4, frontend half) — Completed, merged to `main`
2026-07-23

### Goals

- `/admin/calendar` day/week time-grid (`CalendarGrid`) of status-colored
  booking chips, all state in the URL; prev/today/next links plus
  status/table/search GET-form filters; only the visible range fetched
- Booking chips open `ReservationDetailsDialog` (also used from
  `/admin/reservations` rows): full info, `ReservationActions`, reschedule via
  `SlotGrid` + availability `excludeReservationId`, table assignment with
  inline 409 conflicts
- Backend counterpart merged in booking-api: `from`/`to`/`tableId` admin-list
  filters, reschedule + assign-table endpoints, availability exclude-self
- Deferred: monthly view, table-based view, mark-as-arrived
- Left three PENDING/-moved test bookings in the dev DB for 2026-07-23
  (Calendar Test, Big Party, Second Pair)

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
