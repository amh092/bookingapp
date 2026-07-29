# Current Feature

Demo guided tours (portfolio onboarding): a floating "Demo tour" button on
the public site opens a dialog listing everything a visitor can try —
book a table, find/manage a booking, order pickup, track an order, and
explore the staff panel via the demo login. Picking one starts a
step-by-step spotlight walkthrough (driver.js): a rounded highlight ring
plus a tooltip saying what to click, advancing across pages until the
flow completes.

## Status

Completed — merged to `main` 2026-07-29 as `9fe129d` (frontend only,
branched off `feature/authentication`; no booking-api changes). Verified
in the browser end to end: booking tour (desktop), admin tour (desktop +
390px mobile fallback path), demo prefill on both form steps.

## Goals

- `driver.js` dependency for the spotlight/popover engine (its CSS is
  imported in `globals.css` and restyled to the Tavola card tokens,
  light + dark).
- `src/lib/demo-tours.ts` — typed tour definitions, a path matcher
  (`"/x"` exact, `"/x/*"` nested, or an array of patterns), and
  sessionStorage progress helpers (`tavola.demoTour`) so a tour survives
  page navigations.
- `src/components/demo/DemoTourRunner.tsx` — client engine mounted in the
  **root** layout (covers site + admin): on every route change it resumes
  the active tour, waits for the step's element, and drives one driver.js
  step at a time. Steps advance by clicking the highlighted element
  (`advance: "click"`) or a Next button (`advance: "next"`). Cross-page
  steps advance **by arrival** (pathname match), so a failed form submit
  keeps the guide on the submit button instead of losing the visitor.
- `src/components/demo/DemoGuideButton.tsx` — floating rounded button
  (bottom-right of public pages) opening the tour-list dialog.
- `data-tour="…"` anchors across the booking flow, confirmation/manage
  pages, menu, cart, checkout, order tracking, and the admin login,
  dashboard and reservations screens.

## Notes

- Closing the popover (✕ or overlay click) exits the tour; keyboard
  driving is disabled so arrow keys can't skip our advance logic.
- Elements hidden at a step (e.g. the desktop admin sidebar on mobile)
  are skipped (`optional: true`) or replaced by auto-navigation
  (`fallbackHref`); the visibility check ignores `[inert]` subtrees so
  the closed admin drawer never gets highlighted.
- The admin tour rides on the existing pre-filled demo STAFF login — no
  new backend surface.
- Form steps are pre-filled too: `useDemoTourPrefill(tourId)` fills the
  booking-details and checkout forms with `DEMO_TOUR_CONTACT` (name +
  phone, deliberately no email so no confirmation mail goes to a fake
  address) while the matching tour is active; the fields remount via a
  `key` when the prefill arrives post-hydration.

## Previous Feature

Phase 7 — Authentication & authorization (spec J / §E): NextAuth
(Auth.js v5) fronting booking-api's JWT auth (Argon2, access + refresh
tokens, default-deny global guards, `@Roles()`), `/admin` login and
role-gated UI, plus the pre-filled demo login for visitors.
Completed on `feature/authentication` in both repos (frontend
`953bfa6`), merged to `main` 2026-07-29. Full design and deferred items
(staff CRUD UI, Google OAuth, password reset, refresh revocation table)
in `context/auth-plan.md`.

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
- `84f0cf5` (2026-07-25) Phase 7 email notifications: booking-api mail
  module (Resend + dev console fallback) sending reservation
  create/confirm/cancel/reschedule and order-placed emails, plus
  confirmation-screen copy, on `feature/email-notifications` in both repos;
  merged to `main` 2026-07-25 (booking-api mail module `7545c43`)
- `953bfa6` (2026-07-26 → 07-29) Phase 7 authentication & authorization:
  NextAuth (Auth.js v5) fronting booking-api JWT auth, `/admin/login` with
  role-gated UI and demo login pre-fill, server-only tokens with silent
  refresh, on `feature/authentication` in both repos; merged to `main`
  2026-07-29
- `9fe129d` (2026-07-29) Demo guided tours: floating "Demo tour" button
  with five spotlight walkthroughs (driver.js) across booking, manage,
  ordering, tracking and the staff panel, `data-tour` anchors,
  sessionStorage-resumed cross-page steps and demo-prefilled tour forms,
  on `feature/demo-tour`; merged to `main` 2026-07-29
