#!/usr/bin/env node
/**
 * Convert the collection workbooks in `data-preparation/collections/<name>.xlsx` into the JSON
 * files consumed by the frontend (`src/lib/collections/<name>/units.json` and, if the workbook has
 * a `contents` sheet, `contents.json`).
 *
 * Workbook layout:
 *   - sheet `units` (required): one row per unit (panel, box, …). `Catalog_Number` is the IIIF id
 *     and URL slug, `Unit_Title` the caption. Units without `Catalog_Number` get one derived from
 *     `Panel No` + `Panel side`.
 *   - sheet `contents` (optional): one row per item on a unit. `Unit` references the unit's
 *     `Catalog_Number` (or is derived from `Panel No` + `Panel side`) and `Catalog_Number` links the
 *     item to the main herbarium.
 *
 * Both sheets are kept in sheet order, which is the order shown on the website.
 *
 * Usage:
 *   pnpm convert-collections
 *   pnpm convert-collections -- --collection display-herbarium
 */

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import readXlsxFile from 'read-excel-file/node';
import { parseArgs, sheetToObjects } from './xlsx-utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const INPUT_DIR = resolve(ROOT, 'data-preparation/collections');
const OUTPUT_DIR = resolve(ROOT, 'src/lib/collections');
const MAIN_DATA = resolve(ROOT, 'src/lib/data.json');

/** Catalog numbers that mean "this item has no catalog number". */
const NO_CATALOG_NUMBER = new Set(['na', 'n/a', '-']);

/**
 * IIIF id of a display herbarium panel, e.g. panel 10, side a → `DEMO_10a`.
 *
 * @param {unknown} no
 * @param {unknown} side
 * @returns {string | undefined}
 */
function derivePanelId(no, side) {
	if (no === undefined || side === undefined) return undefined;
	return `DEMO_${no}${side}`;
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
 * @returns {Promise<number>} number of contents catalog numbers missing from the main data
 */
async function convertCollection(name, mainCatalogNumbers) {
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

async function main() {
	const flags = parseArgs();
	const names = flags.collection
		? [String(flags.collection)]
		: (await readdir(INPUT_DIR))
				.filter((file) => file.endsWith('.xlsx') && !file.startsWith('~$'))
				.map((file) => basename(file, '.xlsx'));

	for (const name of names) {
		if (!existsSync(resolve(INPUT_DIR, `${name}.xlsx`))) {
			console.error(`Input file not found: ${name}.xlsx`);
			process.exit(1);
		}
	}

	// the main data is needed to check the contents' catalog numbers; it's generated, so create it
	// first if it isn't there (e.g. in a fresh checkout)
	if (!existsSync(MAIN_DATA)) {
		console.log(`${MAIN_DATA} not found, running xlsx-to-json.js first ...`);
		const result = spawnSync(process.execPath, [resolve(__dirname, 'xlsx-to-json.js')], {
			stdio: 'inherit'
		});
		if (result.status !== 0) {
			console.error('Converting the main data failed.');
			process.exit(result.status ?? 1);
		}
	}

	/** @type {{ Catalog_Number?: string }[]} */
	const mainData = JSON.parse(await readFile(MAIN_DATA, 'utf-8'));
	const mainCatalogNumbers = new Set(mainData.map((record) => record.Catalog_Number));

	let missing = 0;
	for (const name of names) {
		missing += await convertCollection(name, mainCatalogNumbers);
	}
	if (missing > 0) {
		console.warn(`${missing} catalog number(s) not found in the main data (links will 404).`);
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
