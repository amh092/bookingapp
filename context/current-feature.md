# Current Feature


Phase 7 — Authentication & authorization (spec J / §E, roadmap Phase 7):
staff login for `/admin`, JWT auth on booking-api, and role-based access
(OWNER / MANAGER / STAFF). Full design in `context/auth-plan.md`.

**Architecture:** NextAuth (Auth.js v5) fronts booking-api's JWT. NestJS
stays the credential authority (Argon2 + `/auth/login`); Auth.js owns the
frontend session cookie and route guard and carries the NestJS access +
refresh tokens **inside its encrypted JWT, never on the session object**.
The frontend is a pure BFF (`src/lib/api.ts` is server-only), so the
spec's "refresh token in an HTTP-only cookie" becomes: NextAuth's
encrypted cookie holds the tokens, and NestJS `/auth/refresh` takes the
refresh token in the request body (server-to-server). NestJS auth is
stateless JWT — no refresh-token table, **no Prisma migration** (`User`
already has `passwordHash`, `role`, `restaurantId`).

## Status

In progress — `feature/authentication` in both repos. Backend lands first.

## Goals

- **booking-api (Part A):** `src/auth/` module — `AuthService`
  (Argon2 verify with a dummy-verify on unknown email to kill the timing
  oracle; access + refresh token sign/verify with `type`/`jti`/`iss`/`aud`
  claims; refresh = stateless reissuance), `POST /auth/login` (throttled
  5/min), `/auth/refresh`, `/auth/logout`, `GET /auth/me`, passport-jwt
  strategy, `@Public()` + `@Roles()` decorators.
  - **Default-deny authz:** a global `JwtAuthGuard` (`APP_GUARD`) protects
    every route; customer endpoints are opted out with `@Public()`, so a
    forgotten annotation fails closed. `RolesGuard` + `ThrottlerGuard` also
    global. Required env `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (asserted
    different), optional `JWT_ACCESS_TTL`/`JWT_REFRESH_TTL`/`SEED_OWNER_*`.
  - **@Roles():** OWNER → restaurant profile/settings mutations;
    OWNER/MANAGER → menu/table/business-hours/blocked-period mutations;
    all other staff actions (reservation + order management, admin lists)
    stay any-authenticated-staff.
  - Seed one OWNER (upsert by email, never resets a live password).
- **booking-web (Part B):** `next-auth@beta`, `src/auth.ts` (Credentials
  provider calling `/auth/login`; jwt callback with silent refresh;
  session exposes only `role`/`restaurantId`/`error`), `src/proxy.ts`
  guarding `/admin/**`, `/admin/login`, a server-only `authHeaders()` in
  `api.ts` attaching the Bearer to admin calls via `getToken()`, admin
  layout session + Logout, and role-gated menu management.

## Notes

- **Tokens stay server-only** — the `session` callback never exposes the
  NestJS tokens; the Bearer is read server-side with `getToken()`.
- **`proxy.ts`, not `middleware.ts`** — Next.js 16 deprecated `middleware`
  → `proxy` (verified against v16.2.9 docs); `proxy` runs on the Node
  runtime, so the jwt-callback `fetch('/auth/refresh')` needs no edge split.
- **Deferred:** staff-management CRUD UI, Google OAuth, password reset, and
  a `RefreshSession` revocation table (stateless refresh can't revoke
  before `exp`; logout is enforced by NextAuth clearing its cookie).

## Previous Feature

Phase 7 — Email notifications (spec K "Notifications"): reservation and
order emails sent from booking-api via Resend, with a Nest `Logger`
console fallback when `RESEND_API_KEY` is unset (fire-and-forget after the
DB write, only when the customer left an email). Completed, merged to
`main` 2026-07-25 as `84f0cf5` (booking-api mail module `7545c43`)

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
