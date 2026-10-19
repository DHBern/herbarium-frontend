# Herbarium Bernense — Frontend

A purely static, client-side-searchable website for the Herbarium of the Botanical Garden of the
University of Bern. See [README.md](README.md) for the project summary and author credits.

## Tech stack

- **Svelte 5** (runes, `experimental.async` enabled) + **SvelteKit 3**, deployed as a static site
  via `@sveltejs/adapter-static`. Vite 8, TypeScript 6.
- **Tailwind CSS v4** + **Skeleton v5** (`@skeletonlabs/skeleton` + `@skeletonlabs/skeleton-svelte`).
- **mdsvex** for `.md` content (collection descriptions), **@sveltejs/enhanced-img** for images.
- **pnpm** package manager (lockfile v9). Search is client-side with **MiniSearch**; IIIF image
  viewing uses **OpenSeadragon**.

## Commands

- `pnpm dev` — dev server (`pnpm dev -- --open` to open a tab).
- `pnpm build` — static production build into `build/` (previews with `pnpm preview`).
- `pnpm check` — `svelte-kit sync` + `svelte-check` type checking.
- `pnpm lint` / `pnpm format` — Prettier + ESLint.
- `pnpm convert-data` — `data-preparation/xlsx-to-json.js`, converts the Excel export to JSON.

## Project structure

- `vite.config.ts` — **all** SvelteKit/Svelte config lives here, passed to the `sveltekit({...})`
  plugin (adapter, `paths.base`, mdsvex preprocessing, `extensions`, `compilerOptions`,
  `inspector`). There is **no `svelte.config.js`** in SvelteKit 3 — don't recreate it.
- `src/routes/` — SvelteKit pages. `+page.svelte` is the searchable home/list; `illustrations/`,
  `about/`, `impressum/` are content pages; `collections/` lists the curated collections and
  `collections/[collection]/` renders one (content from `src/lib/collections/<name>/`);
  `item/[collection]/[slug]/` is the specimen detail page with the OpenSeadragon IIIF viewer
  (`main` is the collection name for the main herbarium dataset).
- `src/routes/+layout.svelte` — app chrome (header nav, mobile menu, footer) and the global
  `LightBox`. `layout.css` is the global stylesheet / Tailwind entry (see Styling below).
- `src/lib/` — shared code: `data.json` + `structure.json` (main herbarium metadata and the
  column/field config), `collections/<name>/` (`data.json`, `structure.json`, `content.md` per
  collection), `functions.ts` (formatting helpers), `stores.svelte.ts` (runes/writable stores),
  `assets/`, and `components/` (`ItemList`, `ContentContainer`, `LightBox`, `MarkdownLayout` /
  `MarkdownImage` for mdsvex).
- `src/routes/types.ts` — shared `Item` / `PageData` / search TypeScript interfaces.
- `src/herbarium.css` — the custom Skeleton theme (`[data-theme='herbarium']`).
- `static/` — fonts, robots.txt, OpenSeadragon SVG icons. `src/404.html` / `src/app.html` set
  `data-theme`.
- `data-preparation/` — standalone scripts, not part of the build: `xlsx-to-json.js` and Python
  scripts to generate IIIF metadata CSVs (see
  [data-preparation/iiif-metadata/README.md](data-preparation/iiif-metadata/README.md)).

## Static build & routing conventions (SvelteKit 3)

- Everything is prerendered (`export const prerender = true`) with an SPA fallback to `404.html`.
- The site is served under a configurable GitHub Pages `BASE_PATH` (set in CI), so use `resolve` /
  `asset` from `$app/paths` for all internal links and static asset URLs. `base`, `assets` and
  `resolveRoute` **no longer exist**.
  - `resolve` takes a route ID (leading `/`, optional query/hash) plus params only when the route
    has them: `resolve('/item/[collection]/[slug]', { collection, slug })`, `resolve('/about')`,
    ``resolve(`/?s=${encodeURIComponent(q)}`)`` — never pass an empty `{}` for param-less routes.
  - `asset` takes a path **without** leading slash: `asset('favicon.png')`.
- Import shared code via `#lib` (Node subpath imports declared in `package.json`), **not `$lib`**,
  and include the file extension: `import { x } from '#lib/functions.js'`,
  `'#lib/stores.svelte.js'`. CSS `url()`s can't use `#lib` — use relative paths there.
- `page` from `$app/state` (`$app/stores` is gone). `page.url` is readonly — copy with
  `new URL(page.url.href)` before mutating.
- Shallow routing uses `goto(url, { shallow: true, replace: true, state })` (not
  `pushState`/`replaceState`). Shallow navigations also fire `afterNavigate`, so hooks that should
  only react to real navigations bail out on `shallow`. `goto` rejects non-app URLs; use
  `window.location.href` for external ones.
- In pages, read route params from `PageProps` (`let { data, params }: PageProps = $props()`).
- OpenSeadragon is browser-only: import it dynamically inside `onMount`, never at module top level.

## Styling conventions (Tailwind v4 + Skeleton v5)

- **No `tailwind.config.js`.** Configuration is CSS-first in `src/routes/layout.css`:
  `@import 'tailwindcss'` → `@import '@skeletonlabs/skeleton'` →
  `@import '@skeletonlabs/skeleton-svelte'` → `@import '../herbarium'` (custom theme).
- Use current class names: `preset-*` (e.g. `preset-tonal-primary`), not v2 `variant-*`; surface
  pairs like `bg-surface-100-900` without the `-token` suffix; trailing `!important`
  (`bg-primary-100!`, not `!bg-primary-100`). v5 renamed `input-group`/`ig-*` to `field-group`
  and removed `card-hover`.
- Import components from `@skeletonlabs/skeleton-svelte`. v2 APIs (`AppShell`, `AppBar`, `Drawer`,
  `Toast`, `SlideToggle`, `storePopup`, `initializeStores`) **no longer exist** — compose layout
  manually and use compound components (e.g. `Switch` with `Switch.Control/Thumb/Label`, state in
  via `checked`, out via `onCheckedChange`).
- **Gotcha:** the build error `Cannot use @variant with unknown variant: md` is a red herring for a
  leftover Skeleton v2 import — search for and remove the offending v2 API, not a config change.

## Code conventions

- **TypeScript everywhere, no JSDoc typing.** Svelte components use `<script lang="ts">`; type props
  and load functions with real TS (`let { x }: Props = $props()`, `export const load: PageLoad`).
- Use Svelte 5 runes (`$state`, `$derived`, `$props`, `$effect`).
- `tsconfig.json` extends `$app/tsconfig` (not `./.svelte-kit/tsconfig.json`).

## References

- Skeleton (Svelte) docs for LLMs: <https://www.skeleton.dev/llms.txt> (Svelte-specific variant:
  <https://www.skeleton.dev/llms-svelte.txt>). Consult these before touching Skeleton components or
  theme tokens, since v5 differs substantially from v2/v3.

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
