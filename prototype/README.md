# Tavola — UI/UX prototype

A dependency-free HTML + CSS + JS prototype of the restaurant booking platform.
It exists to agree on layout, flows and interaction before any of it is built in
Next.js. Nothing here is part of the Next.js app or its build.

## Run it

```bash
# from the repo root
npx serve prototype          # or: python3 -m http.server 4173 -d prototype
```

Then open <http://localhost:4173>. Opening `prototype/index.html` directly also
works, but a server keeps `localStorage` behaviour consistent.

## Screens

**Public site**

| Page | What it shows |
| --- | --- |
| `index.html` | Landing: hero, live availability badge, featured dishes, hours, location, reviews |
| `menu.html` | Full menu with search and category filters |
| `reserve.html` | Booking flow — guests → date → time → details, with a sticky summary |
| `confirmation.html` | Confirmation code, booking details, add-to-calendar (.ics) |
| `manage.html` | Look up a booking by code, reschedule or cancel it |

**Admin panel** (`admin/`)

| Page | What it shows |
| --- | --- |
| `login.html` | Staff sign in (any credentials work) |
| `dashboard.html` | Today's stats, service timeline, pending requests, peak times |
| `reservations.html` | Filterable list, detail drawer, staff-created bookings |
| `calendar.html` | Day / week / table views with status colours |
| `tables.html` | Floor plan tiles, capacity, sections, occupancy at a chosen hour |
| `menu.html` | Dish list with availability and featured toggles |
| `orders.html` | Order pipeline (phase 6 — flagged as not-yet-built) |
| `customers.html` | Guest history derived from reservations |
| `staff.html` | Team accounts and the role permission matrix |
| `settings.html` | Profile, booking rules, opening hours, blocked periods, data reset |

## How it behaves

- **Availability is really computed.** `assets/js/data.js` applies the rules from
  the spec: opening hours, 90-minute booking duration, 30-minute slots, table
  capacity, blocked periods, and the overlap test
  (`existingStart < requestedEnd AND existingEnd > requestedStart`). Availability
  is re-checked at write time, so double booking is rejected.
- **Bookings persist** to `localStorage`, so a reservation made on the public
  site appears in the admin panel. Settings → *Reset demo data* restores the seed.
- **Demo data is anchored to today**, and the weekly closing day is two days out,
  so the prototype always opens on a live service day.
- **Theme** — dark by default, light via the toggle, remembered per browser.
- **Direction** — the ع / EN toggle switches the public site between Arabic RTL
  and English LTR. The admin panel stays English in the prototype.

## Not covered

Payments, real auth, image uploads, email delivery, and the cart/checkout pages.
Those come with their own features once the reservation MVP is real.
