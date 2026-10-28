#!/usr/bin/env node
/**
 * Convert the main herbarium data and all collection workbooks in one run, so the IIIF
 * Presentation API inventory (the slow part) is loaded only once. The crawl starts right away and
 * overlaps with reading `input.xlsx`.
 *
 * Usage:
 *   pnpm convert
 *   pnpm convert -- --skip-images
 *
 * Accepts the flags of both `xlsx-to-json.js` (`--input`, `--output`) and
 * `collections-to-json.js` (`--collection`).
 */

import { parseArgs } from './xlsx-utils.js';
import { preloadInventory } from './iiif-utils.js';
import { convertMain } from './xlsx-to-json.js';
import { convertCollections } from './collections-to-json.js';

const flags = parseArgs();
if (!flags['skip-images']) preloadInventory();

try {
	const records = await convertMain(flags);
	await convertCollections(
		flags,
		records.map((record) => record.Catalog_Number)
	);
} catch (error) {
	console.error(error);
	process.exit(1);
}
