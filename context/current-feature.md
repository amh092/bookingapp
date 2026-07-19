
# Current Feature

Frontend Setup

## Status

<!-- Not Started|In Progress|Completed -->

Completed

## Goals

<!-- Goals & requirements -->

- Restructure the project to the `src/` layout defined in the project spec (`src/app`, `src/components`, `src/lib`)
- Update `tsconfig.json` paths and `components.json` to point at `src/`
- Remove create-next-app boilerplate from the home page
- Set proper app metadata (title, description)
- Verify `npm run build` passes

## Notes

<!-- Any extra notes -->

- `public/` and config files stay at the project root (Next.js convention)
- Tailwind v4 uses CSS-based config in `src/app/globals.css` — no `tailwind.config` file
- The home page is a minimal placeholder; the real landing page is a separate feature
- shadcn/ui is initialized (base-nova style); components are added per feature as needed

## History

<!-- Keep this updated. Earliest to latest -->

- Project setup and boilerplate cleanup
- Frontend setup: src/ restructure, boilerplate cleanup, metadata, removed unused public/ SVGs
