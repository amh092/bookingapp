# Current Feature


Phase 6 — Online ordering, pickup MVP (spec I/J "Online Ordering", roadmap
Phase 6): customers browse the menu, build a cart, check out for pickup and
track their order; staff manage orders and advance statuses from
`/admin/orders`. Delivery stays a later feature (no fee policy exists in the
restaurant settings yet), but the API keeps the `type` field so it can be
enabled without reshaping the contract.

## Status

Completed — merged to `main` 2026-07-24 as `37a9f32` (booking-api
`d096fa6`), developed on `feature/orders` in both repos

## Goals

- **Backend** — new `src/orders/` module (no migration needed: `Order`/
  `OrderItem` tables and the enums have existed since the init migration):
  - `POST /orders` (public): items `[{menuItemId, quantity, notes?}]` +
    customer details (same name/phone/email rules as reservations) + optional
    order notes; `type` accepts only `PICKUP` for now (400 on `DELIVERY`).
    Prices are **never** taken from the client — unit prices load from the DB
    inside a transaction, dishes must be available and in an active category
    of that restaurant (409 if sold out / deactivated, 404 if unknown),
    subtotal/total computed with `Prisma.Decimal`, money serialized as
    two-decimal strings like the menu module. Customer upserted by phone
    (same identity rule as reservations). `orderNumber` generated from the
    phone-safe alphabet with an `ORD-` prefix, collision-retried on P2002
  - `GET /orders/:orderNumber` (public): full order with items + restaurant
    summary for the tracking page; 404 on unknown
  - `GET /orders/lookup?phone=` (public, declared before `:orderNumber` so
    "lookup" is not matched as a number): in-flight orders only (PENDING →
    OUT_FOR_DELIVERY — completed/cancelled history stays behind the order
    number), exact-match on the trimmed phone (same identity rule as
    `upsertCustomer`), newest first; unknown phone answers an empty `200`
    list, invalid/missing phone 400s
  - `GET /restaurants/:restaurantId/orders` (staff, nested like the admin
    reservations list): filters `status`, `type`, `date` (calendar day in the
    restaurant timezone over `createdAt`), `search` (order #, customer name
    or phone), newest first
  - `PATCH /orders/:id/status` (staff): explicit transition map — PENDING →
    CONFIRMED/CANCELLED, CONFIRMED → PREPARING/CANCELLED, PREPARING →
    READY/CANCELLED, READY → COMPLETED (OUT_FOR_DELIVERY reserved for
    delivery orders), COMPLETED/CANCELLED terminal; 409 on anything else
  - Jest units: order-total calculation (the spec's priority), create guards
    (unknown/sold-out dish, delivery rejected), transition guards
- **Frontend**:
  - `src/types/order.ts`, API client additions (`createOrder`, `getOrder`,
    `getAdminOrders`, `updateOrderStatus`), `src/actions/orders.ts`
  - Cart: `CartProvider` client context in the `(site)` layout, persisted to
    `localStorage`; add-to-cart on available dishes in `DishCard`; header
    cart button with live count (renders empty pre-hydration to avoid
    mismatch)
  - `/cart`: line items with quantity steppers, per-item notes, remove,
    subtotal, empty state linking to `/menu`, CTA to `/checkout`
  - `/checkout`: pickup-only summary + contact form (zod, same phone/email
    rules as booking), server action creates the order, client clears the
    cart and navigates to the confirmation
  - `/orders/[orderNumber]`: order number, status timeline
    (Pending → Confirmed → Preparing → Ready → Completed, cancelled state),
    items, totals, pickup location — the public tracking page
  - `/orders`: "Track your order" lookup — order-number mode (normalizes
    case/whitespace and prefixes `ORD-` when missing) and phone mode
    (`/orders?phone=…`, server-fetched result cards with status pill and
    "Track order" links, empty/invalid/API-down states, arriving with
    `?phone=` preselects phone mode prefilled) — plus "Recent orders on
    this device" (`tavola-recent-orders` in localStorage, capped at 5,
    written on checkout success with the API-confirmed total). Entry
    points: footer "Track your order", cart empty state, and the tracking
    page's not-found block
  - `/admin/orders`: status/type/date/search filters (GET form like
    `/admin/reservations`), order rows with items + totals, action buttons
    driven by the same transition map, `revalidatePath` on update; "Orders"
    joins `AdminNav`

## Notes

- Verified against the live API (production build on :3002 → API on :3001,
  seeded data). curl pass: totals priced from the DB (28.00×2 + 42.00 =
  98.00), client-sent `unitPrice` rejected by the whitelist pipe, delivery /
  empty order / bad phone 400, unknown dish 404, order-number lookup
  normalizes case+whitespace, full transition walk with every illegal move
  409ing (incl. OUT_FOR_DELIVERY on pickup and cancel-after-ready), customer
  reused by phone, admin filters (status/date window in Riyadh tz/search)
  correct. Playwright pass (menu → add-to-cart ×3 → cart steppers + line
  note → checkout validation then submit → `ORD-VY33UR` tracking page →
  cart auto-cleared → /admin/orders Confirm → timeline shows Confirmed →
  unknown-number not-found block); no console errors from the new pages —
  the only 404 is the pre-existing footer "Staff panel" prefetch of
  `/admin/login` (route lands with the auth feature). `npm run lint`, both
  builds, and 145 backend jest tests (24 new) clean. Second browser pass
  for the lookup surfaces: footer link, bare lowercase "vy33ur" →
  `ORD-VY33UR`, phone mode lists the active order while a
  terminal-history-only phone hits the empty state, malformed phone shows
  the validation message without calling the API, and a fresh checkout
  (`ORD-XHAWGQ`) appears under "Recent orders on this device"
- Test orders left in the dev DB: `ORD-ZAHMJ5` (completed), `ORD-G6GFST`
  (cancelled), `ORD-VY33UR` (confirmed) and `ORD-XHAWGQ` (pending) — handy
  for playing with the staff flow; `ORD-GKHC6R` was created outside this
  session and untouched
- The cart is a module-level store behind `useSyncExternalStore`
  (`src/lib/cart-store.ts` + `src/hooks/useCart.ts`, localStorage key
  `tavola-cart`) — the provider-in-layout approach tripped
  `react-hooks/set-state-in-effect`, and the store needs no context at all
- Developed on `feature/orders` branches in both repos per
  `ai-interaction.md` and fast-forward merged to `main`; branches kept
  until their deletion is okayed
- `upsertCustomer` is duplicated from `ReservationsService` (it is private
  there); extracting a shared customers module is a refactor to propose
  separately
- Delivery fee stays `0.00` and `address` null until the delivery feature
  adds a fee policy to restaurant settings
- Rate limiting on public endpoints (now including orders) remains Phase 7

## Previous Feature

Public reservation lookup by phone number on `/reservations/manage` —
`GET /reservations/lookup?phone=` (exact-match, upcoming table-holding
bookings only, `internalNotes` omitted), manage page renders result cards
with code/phone mode toggle (spec B/C) — Completed, committed to `main` as
`dff6908` (booking-api `5e4d16e`)

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
