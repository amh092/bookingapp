# Current Feature

Phase 5 — Menu: public menu browsing, homepage featured dishes and the
`/admin/menu` management page (spec H "Restaurant Menu"; backend counterpart in
booking-api)

## Status

Completed — pending commit. Spans two repos: booking-api (schema migration
`20260723225650_extend_menu_models`, `src/menu/` module, prototype seed) and
bookingapp (this repo: pages, components, actions)

## Goals

- **Types + client** — `src/types/menu.ts` mirrors the API shapes; prices are
  decimal strings ("28.00") in both directions, formatted with the new
  `formatMenuPrice`. `src/lib/api.ts` gains `MENU_TAG`, public
  `getPublicMenu`/`getFeaturedDishes` and the admin category/item CRUD calls
  (the shared `api()` now returns undefined for 204 deletes)
- **Server actions** — `src/actions/menu.ts`: save/delete/toggle for dishes and
  categories, all Zod-validated FormData returning
  `{ success, error?, fieldErrors? }`. The restaurant is resolved server-side
  from the configured slug — no client-supplied restaurantId. After a mutation:
  `updateTag(MENU_TAG)` (not `revalidateTag` — Next 16 deprecates the one-arg
  form and staff must read their own writes immediately) plus `revalidatePath`
  for `/`, `/menu`, `/menu/[category]` and `/admin/menu`
- **Public menu** — `/menu` and `/menu/[category]` (server components over a
  cached `MENU_TAG` fetch in `src/lib/menu-data.ts`): category sections in
  position order, DishCard with image-or-🍽️-fallback, SAR price, dietary tags,
  amber allergen tags, prep time, Featured badge and dimmed "Sold out"
  treatment. `MenuBrowser` (client) adds search over names (en+ar),
  descriptions and dietary tags plus chip links (`All` → `/menu`, category →
  `/menu/[slug]` via `categorySlug()`); unknown or inactive category slugs →
  `notFound()`. Booking CTA band and per-category `generateMetadata` included
- **Homepage** — `FeaturedDishes` now renders the live featured endpoint
  (available dishes in active categories only) with an intentional empty state
  and an API-down fallback; menu mocks (`MENU_*`, `FEATURED_ITEMS`, old
  `DishCard`, old menu types) deleted, other mock data untouched
- **Admin** — `/admin/menu` (server page) + `DishesPanel`, `DishFormDialog`,
  `CategoriesPanel`, `CategoryFormDialog`, `ConfirmDeleteDialog` under
  `src/components/admin/menu/`, and a Base UI `ui/switch`. Dish list: search,
  category chips, dish/sold-out counts, header-row grid on md+ that stacks
  into labelled cards on mobile, availability/featured switches (PATCH via
  action, disabled while pending, no optimistic state), Edit/Delete per row.
  Category tiles: Live/Hidden pill, dish count + position, Edit,
  Activate/Deactivate, Delete with confirmation that pre-warns when the
  category holds dishes and surfaces the backend 409s. "Menu" added to
  AdminNav (prefix matching covers future nested routes)

## Notes

- **Images**: URL storage + preview only (no upload service this phase).
  Admin-entered URLs can point anywhere, so no `images.remotePatterns`
  allowlist can cover them — `DishImage` renders through `next/image` with
  `unoptimized` and swaps to the plate fallback on error. When Phase 7 adds a
  fixed storage host, add it to `remotePatterns` and drop `unoptimized`
- Verified in headless Chrome against the live API (production build on :3002,
  API on :3004): 60+ checks — category order, sold-out dimming+label, search
  incl. dietary tags, chips with `aria-current`/`aria-pressed`,
  `/menu/from-the-grill` filtering, bogus slug 404, dish create (switch
  defaults land)/edit (deduped tags round-trip)/delete, duplicate-category and
  category-with-dishes 409s surfaced in dialogs, deactivating Appetizers hid it
  from `/menu`, 404'd `/menu/appetizers`, dropped its dishes from the homepage
  and kept them in admin, featured toggle adds/removes a dish on the homepage,
  image preview + public render + broken-URL fallback, no horizontal overflow
  at 390px/1280px, dark and light modes, dialog focus containment + Escape,
  zero console errors. `npm run lint` and `npm run build` clean; data restored
  to the seeded state afterwards
- Dev note: the user-started dev server on :3000 still reads
  `API_URL=http://localhost:3001` from `.env.local` while booking-api listens
  on :3004 — pre-existing mismatch, untouched again; verification ran with the
  env var overridden. The booking-api watch process had died mid-session and
  was restarted
- Deferred intentionally: Phase 6 ordering/cart, binary image upload/storage,
  auth on the admin surface (Phase 7 items), Arabic display strings on the
  public site (data fields exist; i18n arrives with the RTL work)
- Working directly on `main` in both repos, matching the last several features

## Previous Feature

Prevent no-show / complete for future reservations (spec B reservation statuses
/ F "Reservation Management": both are after-the-fact outcomes — a booking is
only a no-show or completed once its time has arrived) — Completed, committed
to `main` as `af74e6e` (backend guards committed in booking-api as `9575fdf`)

### Goals

- Stop staff marking a reservation as a no-show *or* completed while it is still
  in the future (`startAt > now`); backend rejects with 409 via a shared
  `rejectIfNotStarted` guard on the `transition` helper, frontend hides the
  "No-show" and "Complete" buttons until the booking has started
  (`hasStarted` threaded through `ReservationDetailsDialog` and every call site)
- The boundary is the reservation's start, not its end: both outcomes become
  available the moment the booking is due, unlike `isPast` (end of slot) which
  gates the "Confirm" action. Cancel stays available throughout

## Earlier Feature

Admin reservation search by booking number (spec F "Reservation Management",
extended to match the confirmation code) — Completed, committed to `main` as
`b0c568d`: reservation-level OR filter (name/phone/`confirmationCode`,
case-insensitive contains) in booking-api, search field relabelled to
"Name, phone, or booking #"

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
