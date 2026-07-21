
# Current Feature

Landing Page (Next.js + shadcn/ui)

## Status

<!-- Not Started|In Progress|Completed -->

Completed

## Goals

<!-- Goals & requirements -->

- Translate `prototype/index.html` into the Next.js app as the real landing page (`/`)
- Port the prototype design tokens (warm dark palette, amber brand color, serif display font)
  into `src/app/globals.css` mapped onto the shadcn/ui variables
- Sections: header, hero, featured dishes, about, reservation CTA band, opening hours,
  location, guest reviews, footer
- Dark mode by default with a light mode toggle (persisted in localStorage, no flash on load)
- Mobile-first responsive layout; nav collapses to a dropdown panel on small screens
- Server components by default; client components only for the theme toggle, mobile nav,
  and the live "open tonight" hero badge
- Typed mock data in `src/lib/mock-data.ts` + `src/types/restaurant.ts`, shaped like the
  Prisma models so it can later be swapped for API responses

## Notes

<!-- Any extra notes -->

- Nav/CTA links point at future routes (`/menu`, `/reservations`, `/admin/login`) that will be
  built feature by feature — they 404 until then
- The hero availability badge estimates open evening slots from opening hours + current time
  only; the real availability engine (table capacity, overlap checks) arrives with the
  reservation feature
- Arabic RTL / i18n toggle from the prototype is deferred (Phase 7 in the roadmap)
- Dish images stay emoji + gradients like the prototype until real images/storage exist

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
