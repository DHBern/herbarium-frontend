#!/usr/bin/env node
/**
 * Convert the collection workbooks in `data-preparation/collections/<name>.xlsx` into the JSON
 * files consumed by the frontend (`src/lib/collections/<name>/units.json` and, if the workbook has
 * a `contents` sheet, `contents.json`).
 *
 * Workbook layout:
 *   - sheet `units` (required): one row per unit (panel, box, …). `Catalog_Number` is the IIIF id
 *     and URL slug, `Unit_Title` the caption. Units without `Catalog_Number` get one derived from
 *     `Panel No` + `Panel side` (zero-padded, e.g. `009b`).
 *   - sheet `contents` (optional): one row per item on a unit. `Unit` references the unit's
 *     `Catalog_Number` (or is derived from `Panel No` + `Panel side`) and `Catalog_Number` links the
 *     item to the main herbarium.
 *
 * Both sheets are kept in sheet order, which is the order shown on the website.
 *
 * Usage:
 *   pnpm convert            (main data + all collections, one shared IIIF inventory)
 *   pnpm convert-collections
 *   pnpm convert-collections -- --collection display-herbarium
 *
 * Every unit gets an `Image` field ("available" / "not available") from a check against the IIIF
 * Presentation API inventory (shared across workbooks); `--skip-images` skips it.
 */

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import readXlsxFile from 'read-excel-file/node';
import { parseArgs, sheetToObjects } from './xlsx-utils.js';
import { checkImages, IMAGE_AVAILABLE, IMAGE_MISSING } from './iiif-utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const INPUT_DIR = resolve(ROOT, 'data-preparation/collections');
const OUTPUT_DIR = resolve(ROOT, 'src/lib/collections');
const MAIN_DATA = resolve(ROOT, 'src/lib/data.json');

/** Catalog numbers that mean "this item has no catalog number". */
const NO_CATALOG_NUMBER = new Set(['na', 'n/a', '-']);

/**
 * IIIF manifest id of a display herbarium panel: the zero-padded panel number plus side, e.g.
 * panel 9, side b → `009b` (manifest `…/presentation/v3.0/boga/manifest/009b`).
 *
 * @param {unknown} no
 * @param {unknown} side
 * @returns {string | undefined}
 */
function derivePanelId(no, side) {
	if (no === undefined || side === undefined) return undefined;
	return `${String(no).trim().padStart(3, '0')}${String(side).trim()}`;
}

/**
 * @param {unknown} value
 * @returns {string | undefined}
 */
function toId(value) {
	if (value === undefined || value === null) return undefined;
	const id = String(value).trim();
	return id === '' || NO_CATALOG_NUMBER.has(id.toLowerCase()) ? undefined : id;
}

/**
 * @param {string} name
 * @param {Set<string>} mainCatalogNumbers
 * @param {boolean} skipImages
 * @returns {Promise<number>} number of contents catalog numbers missing from the main data
 */
async function convertCollection(name, mainCatalogNumbers, skipImages) {
	const inputPath = resolve(INPUT_DIR, `${name}.xlsx`);
	const sheets = await readXlsxFile(inputPath);
	const sheet = (sheetName) => sheets.find((s) => s.sheet.toLowerCase() === sheetName)?.data;

	const unitRows = sheet('units');
	if (!unitRows) {
		throw new Error(`${name}.xlsx has no "units" sheet.`);
	}

	const units = sheetToObjects(unitRows).map((unit) => ({
		...unit,
		Catalog_Number: toId(unit.Catalog_Number) ?? derivePanelId(unit['Panel No'], unit['Panel side'])
	}));

	const unitIds = new Set();
	for (const unit of units) {
		if (!unit.Catalog_Number) throw new Error(`${name}: unit without Catalog_Number.`);
		if (!unit.Unit_Title)
			throw new Error(`${name}: unit ${unit.Catalog_Number} has no Unit_Title.`);
		if (unitIds.has(unit.Catalog_Number)) {
			throw new Error(`${name}: duplicate unit ${unit.Catalog_Number}.`);
		}
		unitIds.add(unit.Catalog_Number);
	}

	if (!skipImages) {
		const withImage = await checkImages(units.map((unit) => unit.Catalog_Number));
		for (const unit of units) {
			unit.Image = withImage.has(unit.Catalog_Number) ? IMAGE_AVAILABLE : IMAGE_MISSING;
		}
	}

	const outDir = resolve(OUTPUT_DIR, name);
	await mkdir(outDir, { recursive: true });
	await writeFile(resolve(outDir, 'units.json'), JSON.stringify(units, null, '\t') + '\n', 'utf-8');
	console.log(`${name}: ${units.length} units`);

	const contentRows = sheet('contents');
	if (!contentRows) return 0;

	let missing = 0;
	const contents = sheetToObjects(contentRows).map((item) => {
		const { Catalog_Number, ...rest } = item;
		const unit = toId(item.Unit) ?? derivePanelId(item['Panel No'], item['Panel side']);
		if (!unit || !unitIds.has(unit)) {
			throw new Error(`${name}: content item references unknown unit "${unit}".`);
		}
		const catalogNumber = toId(Catalog_Number);
		if (catalogNumber && !mainCatalogNumbers.has(catalogNumber)) {
			console.warn(`  warning: ${name} / ${unit}: ${catalogNumber} is not in the main data`);
			missing++;
		}
		return { ...rest, Unit: unit, ...(catalogNumber ? { Catalog_Number: catalogNumber } : {}) };
	});

	await writeFile(
		resolve(outDir, 'contents.json'),
		JSON.stringify(contents, null, '\t') + '\n',
		'utf-8'
	);
	console.log(`${name}: ${contents.length} content items`);
	return missing;
}

/**
 * @param {Record<string, string | boolean>} flags
 * @param {Iterable<unknown>} [mainCatalogNumbers] main data catalog numbers; read from
 *   `src/lib/data.json` (converting it first if missing) when omitted
 */
export async function convertCollections(flags, mainCatalogNumbers) {
	const names = flags.collection
		? [String(flags.collection)]
		: (await readdir(INPUT_DIR))
				.filter((file) => file.endsWith('.xlsx') && !file.startsWith('~$'))
				.map((file) => basename(file, '.xlsx'));

	for (const name of names) {
		if (!existsSync(resolve(INPUT_DIR, `${name}.xlsx`))) {
			throw new Error(`Input file not found: ${name}.xlsx`);
		}
	}

	if (!mainCatalogNumbers) {
		// the main data is generated, so create it first if it isn't there (e.g. in a fresh checkout)
		if (!existsSync(MAIN_DATA)) {
			console.log(`${MAIN_DATA} not found, converting the main data first ...`);
			const { convertMain } = await import('./xlsx-to-json.js');
			await convertMain({ 'skip-images': Boolean(flags['skip-images']) });
		}
		/** @type {{ Catalog_Number?: string }[]} */
		const mainData = JSON.parse(await readFile(MAIN_DATA, 'utf-8'));
		mainCatalogNumbers = mainData.map((record) => record.Catalog_Number);
	}
	const mainIds = new Set(mainCatalogNumbers);

	let missing = 0;
	for (const name of names) {
		missing += await convertCollection(name, mainIds, Boolean(flags['skip-images']));
	}
	if (missing > 0) {
		console.warn(`${missing} catalog number(s) not found in the main data (links will 404).`);
	}
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	convertCollections(parseArgs()).catch((error) => {
		console.error(error);
		process.exit(1);
	});
}
