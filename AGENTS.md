# Herbarium Bernense — Frontend

A purely static, client-side-searchable website for the Herbarium of the Botanical Garden of the
University of Bern. See [README.md](README.md) for the project summary and author credits.

## Tech stack

- **Svelte 5** (runes) + **SvelteKit 2**, deployed as a static site via `@sveltejs/adapter-static`.
- **Tailwind CSS v4** + **Skeleton v4** (`@skeletonlabs/skeleton` + `@skeletonlabs/skeleton-svelte`).
- **pnpm** package manager (lockfile v9). Search is client-side with **MiniSearch**; IIIF image
  viewing uses **OpenSeadragon**.

## Commands

- `pnpm dev` — dev server (`pnpm dev -- --open` to open a tab).
- `pnpm build` — static production build into `build/` (previews with `pnpm preview`).
- `pnpm check` — `svelte-check` type checking. Note: skeleton-svelte's unused `tree-view`
  component ships broken `.d.ts` files, so `check` reports `node_modules` errors that are not ours.
- `pnpm lint` / `pnpm format` — Prettier + ESLint.

## Project structure

- `src/routes/` — SvelteKit pages. `+page.svelte` is the searchable home/list; `illustrations/`,
  `about/`, `impressum/` are content pages; `item/[slug]/` is the specimen detail page with the
  OpenSeadragon IIIF viewer.
- `src/routes/+layout.svelte` — app chrome (header nav, mobile menu, footer) and the global
  `LightBox`. `layout.css` is the global stylesheet / Tailwind entry (see Styling below).
- `src/lib/` — shared code: `data.json` + `structure.json` (all herbarium metadata and the
  column/field config), `functions.ts` (formatting helpers), `stores.svelte.ts` (runes/writable
  stores), and `components/` (`ItemList`, `ContentContainer`, `LightBox`).
- `src/routes/types.ts` — shared `Item` / `PageData` / search TypeScript interfaces.
- `src/herbarium.css` — the custom Skeleton theme (`[data-theme='herbarium']`).
- `static/` — fonts, robots.txt, OpenSeadragon SVG icons. `src/404.html` / `src/app.html` set
  `data-theme`.
- `data-preparation/` — standalone Python scripts to generate IIIF metadata CSVs (not part of the
  build); see [data-preparation/iiif-metadata/README.md](data-preparation/iiif-metadata/README.md).

## Static build & routing conventions

- Everything is prerendered (`export const prerender = true`) with an SPA fallback to `404.html`.
- Use `resolve` / `assets` from `$app/paths` for all internal links and static asset URLs — the site is served under a configurable GitHub Pages `BASE_PATH` (set in CI).
- OpenSeadragon is browser-only: import it dynamically inside `onMount`, never at module top level.

## Styling conventions (Tailwind v4 + Skeleton v4)

- **No `tailwind.config.js`.** Configuration is CSS-first in `src/routes/layout.css`:
  `@import 'tailwindcss'` → `@import '@skeletonlabs/skeleton'` →
  `@import '@skeletonlabs/skeleton-svelte'` → `@import '../herbarium'` (custom theme).
- Use **v4 class names**: `preset-*` (e.g. `preset-tonal-primary`), not v2 `variant-*`; surface pairs
  like `bg-surface-100-900` without the `-token` suffix; trailing `!important` (`bg-primary-100!`,
  not `!bg-primary-100`).
- Import components from `@skeletonlabs/skeleton-svelte`. v2 APIs (`AppShell`, `AppBar`, `Drawer`,
  `Toast`, `SlideToggle`, `storePopup`, `initializeStores`) **no longer exist** — compose layout
  manually and use v4 components (e.g. `Switch` with its compound `Switch.Control/Thumb/Label`).
- **Gotcha:** the build error `Cannot use @variant with unknown variant: md` is a red herring for a
  leftover Skeleton v2 import — search for and remove the offending v2 API, not a config change.

## Code conventions

- **TypeScript everywhere, no JSDoc typing.** Svelte components use `<script lang="ts">`; type props
  and load functions with real TS (`let { x }: Props = $props()`, `export const load: PageLoad`).
- Use Svelte 5 runes (`$state`, `$derived`, `$props`, `$effect`).

## References

- Skeleton (Svelte) docs for LLMs: <https://www.skeleton.dev/llms.txt> (Svelte-specific variant:
  <https://www.skeleton.dev/llms-svelte.txt>). Consult these before touching Skeleton components or
  theme tokens, since v4 differs substantially from v2/v3.

---

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
