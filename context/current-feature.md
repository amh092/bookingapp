# Current Feature

Phase 7 — Email notifications (spec K "Notifications", roadmap Phase 7):
reservation and order emails sent from booking-api via Resend, with a
console fallback in development

## Status

In progress, on `feature/email-notifications` (both repos — mail module
in booking-api, confirmation-copy tweaks in bookingapp)

## Goals

- **Mail module (booking-api)** — `src/mail/` with a `MailService` used by
  the reservations and orders modules:
  - Sends through Resend when `RESEND_API_KEY` is set; without it, logs
    the rendered email through the Nest `Logger` so the whole flow works
    in development with no account
  - Optional env vars `RESEND_API_KEY` and `MAIL_FROM` (default: Resend's
    `onboarding@resend.dev` test sender) validated in `env.validation.ts`
  - Fire-and-forget after the DB write succeeds: a mail failure is logged
    and never fails or delays the API response
- **Reservation emails** (only when the customer provided an email):
  - Created → "request received" with confirmation code, date/time in the
    restaurant's timezone, guests, and the manage link
    `${FRONTEND_URL}/reservations/manage/[code]`
  - Confirmed (staff) → confirmation email
  - Cancelled (customer or staff) → cancellation email
  - Rescheduled → updated-details email
- **Order email** (only when the customer provided an email): order placed
  → confirmation with items, totals, pickup details, and the tracking link
  `${FRONTEND_URL}/orders/[orderNumber]`
- **Frontend copy** — reservation and order confirmation screens say a
  confirmation email was sent when the customer left an email address

## Notes

- Order status-update emails (ready / out for delivery…) and reservation
  reminder emails are deferred — reminders need a scheduler, and kitchen
  transitions would be noisy without preference controls
- Templates are simple inline HTML + plain-text builders in the mail
  module — no templating dependency; dates formatted with `Intl` in the
  restaurant's timezone

## Previous Feature

Live order status on `/orders/[orderNumber]` (spec J "Track order
status", follow-up to Phase 6): `OrderStatusRefresher` client component
calling `router.refresh()` every 10s for non-terminal orders, skipping
hidden-tab ticks and catching up on `visibilitychange`, pulsing "Live"
indicator, "updates automatically" copy — Completed, merged to `main`
2026-07-25 as `4d12fe4` (bookingapp only)

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
- `4d12fe4` (2026-07-25) Live order status on `/orders/[orderNumber]`:
  OrderStatusRefresher polling via `router.refresh()` with hidden-tab
  skip, "Live" indicator, auto-update copy, on
  `feature/live-order-status`; merged to `main` 2026-07-25
