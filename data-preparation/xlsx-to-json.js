#!/usr/bin/env node
/**
 * Convert the herbarium metadata XLSX into the JSON file consumed by the
 * SvelteKit frontend (`src/lib/data.json`).
 *
 * Usage:
 *   pnpm convert-data
 *   pnpm convert-data -- --input ./other.xlsx --output ./src/lib/data.json
 *   node data-preparation/xlsx-to-json.js --input ./other.xlsx
 *
 * Every record gets an `Image` field ("available" / "not available") from a check against the
 * IIIF Presentation API inventory; `--skip-images` skips it (the field is then omitted
 * and the frontend shows every item as having an image).
 */

import { writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import readXlsxFile from 'read-excel-file/node';
import { parseArgs, rowToObject } from './xlsx-utils.js';
import { checkImages, IMAGE_AVAILABLE, IMAGE_MISSING } from './iiif-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT = resolve(__dirname, '..');

const DEFAULT_INPUT = resolve(ROOT, 'data-preparation/input.xlsx');
const DEFAULT_OUTPUT = resolve(ROOT, 'src/lib/data.json');

async function main() {
	const flags = parseArgs();
	const inputPath = resolve(flags.input ? String(flags.input) : DEFAULT_INPUT);
	const outputPath = resolve(flags.output ? String(flags.output) : DEFAULT_OUTPUT);

	if (!existsSync(inputPath)) {
		console.error(`Input file not found: ${inputPath}`);
		process.exit(1);
	}

	console.log(`Reading ${inputPath} ...`);
	const result = await readXlsxFile(inputPath);

	// read-excel-file returns an array of `{ sheet, data }` objects.
	const sheet = Array.isArray(result) ? result[0] : result;
	/** @type {unknown[][]} */
	const rows = sheet.data;

	if (!Array.isArray(rows) || rows.length === 0) {
		console.error('The workbook appears to be empty.');
		process.exit(1);
	}

	/** @type {string[]} */
	const headers = rows[0].map((header) => String(header ?? '').trim());
	const dataRows = rows.slice(1);

	const records = dataRows
		.map((row) => rowToObject(headers, row))
		.filter((record) => {
			// Skip rows without a usable identifier.
			const catalogNumber = record.Catalog_Number;
			return typeof catalogNumber === 'string' && catalogNumber.length > 0;
		});

	console.log(`Parsed ${records.length} records from the first worksheet.`);

	if (!flags['skip-images']) {
		const withImage = await checkImages(
			records.map((record) => record.Catalog_Number),
			{ warnMissing: true, inputName: inputPath }
		);
		for (const record of records) {
			record.Image = withImage.has(record.Catalog_Number) ? IMAGE_AVAILABLE : IMAGE_MISSING;
		}
		const count = records.filter((record) => record.Image === IMAGE_AVAILABLE).length;
		console.log(`${count} of ${records.length} records have an image.`);
	}

	await writeFile(outputPath, JSON.stringify(records, null, '\t') + '\n', 'utf-8');
	console.log(`Wrote ${outputPath}`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
