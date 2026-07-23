
# Current Feature

Admin reservation search by booking number (spec F "Reservation Management":
"Search by customer name or phone", extended to also match the booking
confirmation code)

## Status

<!-- Not Started|In Progress|Completed -->

Completed — pending commit. Spans two repos: booking-api (the search query) and
bookingapp (the search field label).

## Goals

- Let staff type or paste a booking confirmation code into the existing
  `/admin/reservations` search box and find that reservation, alongside the
  current name and phone matching — one box, no new field
- Backend: widen the `search` filter in `findAllForRestaurant`
  (`booking-api/src/reservations/reservations.service.ts`) from a customer-only
  OR (name/phone) to a reservation-level OR that also matches `confirmationCode`
  (`contains`, case-insensitive so lowercase and partial codes match); update
  the DTO description and the controller's Swagger summary
- Frontend: relabel the search field from "Customer" / "Name or phone" to
  "Search" / "Name, phone, or booking #" in
  `src/app/admin/reservations/page.tsx` — the value already flowed through as
  `search`, so there is no wiring change

## Notes

- Verified live against the API on :3004: an exact code returns the one booking,
  the lowercased code returns the same (case-insensitive), the first three
  characters match, a bogus code returns none, and code + a mismatching status
  filter returns none (the OR is ANDed with the other filters, not replacing
  them); name search still returns all 12. `npm run build` passes in both repos
  and the 49 `reservations.service` tests pass with the updated where-shape
  assertion
- Working directly on `main` in both repos, matching the last two features

## Previous Feature

Admin Sidebar Navigation (spec "Admin Panel Layout → Sidebar Navigation" and
"Responsive Requirements": persistent sidebar on desktop, drawer on mobile) —
Completed, committed to `main` as `b94f14b`

## Goals

<!-- Goals & requirements -->

- Replace the admin top-bar nav in `src/app/admin/layout.tsx` with the shell the
  spec asks for: a persistent sidebar from `lg` up, a slide-in drawer below it.
  Ports `buildSidebar()` / `setSidebar()` from
  `prototype/assets/js/admin.js` to Next.js + Tailwind
- No phase in the roadmap owns this — it is admin-shell work that the header nav
  was standing in for. Doing it now because the header already overflowed at
  390px with three links, and Phases 5/6 add six more sections
- Sidebar: brand block, "Operations" section label, icon + label nav rows with
  `aria-current` active state, footer with the "View site" link
- Only the three built routes are listed (Dashboard, Reservations, Calendar).
  The other six spec sections (Tables, Menu, Orders, Customers, Staff,
  Settings) get added as each phase ships, so the nav never points at a 404
- Active state: `/admin` matches exactly (it is the dashboard itself), the rest
  match by prefix so future detail routes stay highlighted
- Mobile: sticky top bar with a hamburger, brand and "View site"; the drawer
  slides over a scrim and closes on scrim click, close button, Escape, or
  navigation
- Two new client components (`AdminShell` for the drawer state, `AdminNav` for
  the links); pages stay server components, passed through as `children`
- No page-level changes — every admin page keeps its own container and `h1`

## Notes

- Working directly on `main` again (Ahmed's call — no feature branch)
- `useEffect(() => setDrawerOpen(false), [pathname])` fails the
  `react-hooks/set-state-in-effect` lint rule; the drawer instead closes from an
  `onNavigate` callback on the links, the same way `MobileNav` does
- The drawer stays mounted so it can slide; `inert` (React 19) keeps it out of
  the tab order and the accessibility tree while it is off-screen
- Verified in headless Chrome against the live API at 1280px and 390px:
  240px sidebar with `aria-current` on `/admin` and `/admin/calendar`, no mobile
  top bar on desktop; on mobile the drawer opens from the hamburger, the scrim
  covers the top bar and page (`elementFromPoint` hits the scrim, not the links
  under it), and it closes on Escape, scrim click and navigation. No horizontal
  overflow at either width, zero console errors
- Dev note: `booking-api/.env` sets `PORT=3004` while this app's `.env.local`
  has `API_URL="http://localhost:3001"` — verification ran with the port
  overridden; the mismatch is pre-existing and untouched

## Earlier Feature

Admin Dashboard (MVP item; spec "Dashboard Metrics", reservation-only subset) —
Completed, committed to `main` 2026-07-23 as `1d779e6`

### Goals

- `/admin` became the dashboard page (it previously redirected to
  `/admin/reservations`), laid out after `prototype/admin/dashboard.html` minus
  the panels that need the orders/menu modules
- Stat grid for today in the restaurant's timezone (reservations, confirmed,
  pending, cancelled, guests expected, 30-day no-show rate), "Today's service"
  timeline, "Pending requests" with inline `ReservationActions`, "Peak times"
  bar list, and the next 8 upcoming bookings
- Server-rendered from the existing admin endpoints only, reusing
  `ReservationDetailsDialog`, `ReservationActions` and `StatusPill`
- Adding the third nav link overflowed the admin header at 390px; patched by
  hiding the "· Staff" brand suffix below `sm` and letting the nav scroll
  horizontally — replaced properly by the sidebar feature above
- The two PENDING test bookings got confirmed mid-verification (live Confirm
  clicks in the browser), so the dev DB has no pending bookings — the pending
  panel shows its "All caught up 🎉" empty state

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
