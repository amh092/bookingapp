# Current Feature

Live order status on the public tracking page: `/orders/[orderNumber]`
follows the kitchen automatically instead of telling the customer to
refresh (spec J "Track order status"; follow-up to Phase 6 `37a9f32`)

## Status

In progress, on `feature/live-order-status` (bookingapp only — no API
changes)

## Goals

- `OrderStatusRefresher` client component: `router.refresh()` every 10s
  while the order is in progress, skipping ticks while the tab is hidden
  and catching up on `visibilitychange`; renders nothing
- Mounted on the tracking page with `active` only for non-terminal orders
  (completed/cancelled orders stop polling), a pulsing "Live" indicator
  next to the Status heading, and the "Refresh this page" copy replaced
  with "This page updates automatically."

## Notes

- Polling + server-component re-render was chosen over SWR/WebSockets: the
  page is already dynamic (`no-store` fetch), `router.refresh()` re-renders
  it in place without scroll reset, and no client-reachable API surface or
  socket infrastructure is needed for the MVP
- The admin `/admin/orders` list still only updates on staff actions and
  full navigations — polling there (to see new orders arrive) is a
  possible follow-up, not in scope here

## Previous Feature

Phase 6 — Online ordering, pickup MVP (spec I/J, roadmap Phase 6): cart
(`useSyncExternalStore` over localStorage) + add-to-cart on dishes +
header badge, `/cart` and `/checkout` (server action, API-priced totals),
`/orders/[orderNumber]` tracking timeline, `/orders` lookup by number /
phone (`GET /orders/lookup?phone=`, in-flight orders only) / recent orders
on the device, `/admin/orders` management driven by the API's status
transition map; delivery deferred (no fee policy in settings yet) —
Completed, merged to `main` 2026-07-24 as `37a9f32` + docs `a65c0e9`
(booking-api orders module `d096fa6`)

## History

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
- `dff6908` (2026-07-24) Public reservation lookup by phone on
  `/reservations/manage`: code/phone mode toggle, result cards, dynamic manage
  page; committed directly to `main` (booking-api lookup endpoint `5e4d16e`)
- `37a9f32` (2026-07-24) Phase 6 online ordering, pickup MVP: cart +
  checkout, `/orders/[orderNumber]` tracking, `/orders` lookup (number /
  phone / recent-on-device), `/admin/orders` management, on
  `feature/orders`; merged to `main` 2026-07-24 (booking-api orders module
  `d096fa6`)
