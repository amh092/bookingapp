
# Current Feature

Admin Booking Calendar (Phase 4, frontend half)

## Status

<!-- Not Started|In Progress|Completed -->

In Progress (on `feature/admin-calendar`)

## Goals

<!-- Goals & requirements -->

- `/admin/calendar` — staff calendar of reservations, server-rendered with all
  state in the URL (same GET-form convention as the reservation list):
  `?view=day|week&date=YYYY-MM-DD&status=&tableId=&search=`
- Both views render the prototype's time-grid (`CalendarGrid`): a time gutter
  with one row per opening hour (computed from business hours, stretched to fit
  outlying bookings) and one column per day — 1 for day view, Sun–Sat for week
  view. Events are status-colored blocks (left accent + soft fill, cancelled
  struck through, no-show dimmed) with a legend above; closed days labelled in
  the column head; the grid scrolls horizontally on narrow screens
- Prev / Today / Next and the day/week toggle are plain links; filters (status,
  table, customer name/phone, date anchor) are a GET form
- Only the visible range is fetched: `date=` for day view, new `from`/`to`
  params for week view
- Each booking chip opens a details dialog (client component) with:
  - Full booking info + the existing `ReservationActions`
    (confirm/complete/no-show/cancel) reused as-is
  - Reschedule: pick a date → available slots (reuses `SlotGrid` +
    `getAvailabilityAction` with a new `excludeReservationId` so the booking's
    own table doesn't block its slots) → server action → refresh
  - Table assignment: select an active table → server action; conflicts
    surface as inline errors (409 from the API)
- No-show stays Phase 3 logic — the calendar only surfaces it (status pill has
  a text label, plus the status filter); no new status or endpoint
- Calendar link added to the admin nav (reuses `NavLink` active-state
  highlighting)
- The same details dialog also opens from `/admin/reservations` rows (the
  booking info is the trigger; the inline quick actions stay) — one component,
  one server action, one API endpoint, so no duplicated rules between the two
  views (spec F lists "Assign tables" under general reservation management)
- Backend counterpart on booking-api's `feature/admin-calendar` branch:
  `from`/`to`/`tableId` admin-list filters, `PATCH /reservations/:id/reschedule`,
  `PATCH /reservations/:id/table`, availability exclude-self — see its
  `context/current-feature.md`
- Explicitly deferred: monthly view, table-based view, mark-as-arrived (no such
  status in the schema)

## Notes

- Verified in headless Chrome (puppeteer-core driving system Chrome) against the
  live API: status/table/search filters, event → details dialog, reschedule via
  SlotGrid (booking moved 7:00 → 8:00 PM, table kept), assign-table success and
  inline 409 ("Table 2 is already booked for that time"), nested
  cancel-confirmation dialog over the details dialog — zero console errors; no
  horizontal page overflow at 390 px
- First cut rendered stacked day cards; reworked to the prototype's
  `prototype/admin/calendar.html` time-grid after Ahmed flagged the mismatch,
  and confirmed by Ahmed in the browser
- After a successful reschedule the dialog may close (the chip remounts under a
  new time group after `router.refresh()`) — acceptable; the calendar updates
  either way
- Left three PENDING/-moved test bookings in the dev DB for 2026-07-23
  (Calendar Test, Big Party, Second Pair)

## Previous Feature

SiteHeader server/client split (refactor) — Completed

### Goals

- `SiteHeader` became a server component; only the interactive pieces stay
  client: `ThemeToggle` (as-is), new `MobileNav` (hamburger toggle + panel),
  new `NavLink` (`usePathname` active-link highlighting)
- No visual or behavioral changes; `NAV_LINKS` stays in `SiteHeader` and is
  passed to `MobileNav` as a prop
- Follow-up on the same branch: header brand name comes from the API
  (`getRestaurant`) with `cache: "force-cache"` — pure build-time SSG (Ahmed's
  call: a rebuild picks up a rename), falling back to the mock "Tavola" name if
  the API is unreachable at build time. The fetch is tagged `RESTAURANT_TAG`
  ("restaurant", exported from `src/lib/api.ts`) — inert until the future admin
  settings action calls `revalidateTag(RESTAURANT_TAG)`. Page titles/meta and
  the footer still use mock branding — separate cleanup

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
