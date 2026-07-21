
# Current Feature

Static UI/UX Prototype (HTML + CSS + JS)

## Status

<!-- Not Started|In Progress|Completed -->

Completed

## Goals

<!-- Goals & requirements -->

- Build a clickable, framework-free prototype of the whole product in `prototype/`
- Public site: landing, menu, reservation flow (guests → date → time → details), confirmation, manage booking
- Admin panel: login, dashboard, reservations, calendar, tables, menu, settings
- Demonstrate the availability UX: only bookable slots appear, slots react to guests + date
- Dark mode by default with a light mode toggle
- Arabic RTL / English LTR direction toggle on the public site
- Mobile-first responsive layout, admin sidebar becomes a drawer on mobile
- No build step, no dependencies — open `prototype/index.html` in a browser

## Notes

<!-- Any extra notes -->

- This is a design/UX reference only. It is not wired to the API and is not part of the Next.js build
- Mock data lives in `prototype/assets/js/data.js` (tables, business hours, reservations, menu, orders)
- Slot availability is computed client-side with the same rules as the spec (opening hours, booking
  duration, table capacity, overlap check) so the interaction feels real
- Images are CSS gradients + emoji so the prototype works fully offline
- Admin panel stays English-only in the prototype; the i18n toggle covers the public site
- Next step after review: translate these screens into Next.js + shadcn/ui components feature by feature

## History

<!-- Keep this updated. Earliest to latest -->

- `52fd12c` (2026-07-19) Project setup — initial commit from Create Next App
- `25716d2` (2026-07-19) Frontend setup: src/ restructure, boilerplate cleanup, metadata,
  removed unused public/ SVGs
- `327fee9` (2026-07-20) Added the coding standards document to `context/`
- `c2220f9` (2026-07-20) Documented the class-name merge helpers in `src/lib/utils.ts`
- _(uncommitted)_ Static UI/UX prototype: public site + admin panel in plain HTML/CSS/JS
  on `feature/ui-prototype`
