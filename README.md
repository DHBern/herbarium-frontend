# Herbarium

This website is a purely static build with a client-side search component. It is hosted by Github and was developed by [Sebastian Flick](https://github.com/flicksolutions) and [Peter Dängeli](https://github.com/pdaengeli) of the [Data Science Lab](https://github.com/dsl-unibe-ch) using Svelte and Svelte-Kit.

All the metadata for the herbarium is contained in this JSON: [src/lib/data.json](https://github.com/DHBern/herbarium-frontend/blob/main/src/lib/data.json)

## Developing

If you want to run this locally installe dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create the static production version of this app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Converting metadata

Run `pnpm convert-data` to convert `data-preparation/input.xlsx` into `src/lib/data.json`,
or `pnpm convert-collections` to convert the workbooks in `data-preparation/collections/`.
The main conversion also accepts `--input <path>` and `--output <path>`.

Both commands inventory the nested collections below the
[IIIF herbarium collection](https://iiif.ub.unibe.ch/presentation/v3.0/boga/collection/herbarium)
and write an `Image` field (`"available"` / `"not available"`). Specimen IDs come from manifest
labels, so multi-image specimens are recognised without assuming a `<Catalog_Number>.tif`
filename. Display herbarium panels are identified by their manifest label, the zero-padded panel
number plus side (e.g. `009b`, manifest
<https://iiif.ub.unibe.ch/presentation/v3.0/boga/manifest/009b>); `convert-collections` derives
the same id from `Panel No` + `Panel side`. Main-herbarium manifests (labels starting with
`BERN-`, `Sheet-` or `BOX-`) are not opened individually. This keeps the crawl to roughly 1,600
requests.
The inventory is loaded once per command, even when converting multiple collection workbooks.
Up to 16 requests run concurrently; each completed request frees a slot immediately, so one
slow response does not stall a whole batch. Progress is printed every 10 seconds, including
completed, active and queued requests and the oldest active URLs. Failed requests are retried
up to three attempts with a 60-second timeout per attempt; retries are logged.

The main conversion warns about each `BERN-…` / `Sheet-…` / `BOX-…` ID present on IIIF but
absent from the input workbook, followed by a total. Display identifiers are excluded from these
warnings;
collection workbooks have their own image-availability checks. Warnings do not add records to
the generated data. An incomplete or failed IIIF inventory aborts conversion before writing
image availability rather than guessing which records have images.

Pass `--skip-images` to either command to avoid IIIF requests and inventory warnings. The
`Image` field is then omitted, and the frontend treats every record as having an image.
