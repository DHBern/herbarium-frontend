#!/usr/bin/env node
/**
 * Convert the herbarium metadata XLSX into the JSON file consumed by the
 * SvelteKit frontend (`src/lib/data.json`).
 *
 * Usage:
 *   pnpm convert-data
 *   pnpm convert-data -- --input ./other.xlsx --output ./src/lib/data.json
 *   node data-preparation/xlsx-to-json.js --input ./other.xlsx
 */

import { writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import readXlsxFile from 'read-excel-file/node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT = resolve(__dirname, '..');

const DEFAULT_INPUT = resolve(ROOT, 'data-preparation/input.xlsx');
const DEFAULT_OUTPUT = resolve(ROOT, 'src/lib/data.json');

/**
 * Parse simple CLI flags of the form `--key value` or `--key=value`.
 * @returns {Record<string, string | boolean>}
 */
function parseArgs() {
	const args = process.argv.slice(2);
	const flags = {};
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg.startsWith('--')) {
			const key = arg.replace(/^--/, '');
			const next = args[i + 1];
			if (next && !next.startsWith('--')) {
				flags[key] = next;
				i++;
			} else if (arg.includes('=')) {
				const [k, v] = arg.split('=');
				flags[k.replace(/^--/, '')] = v;
			} else {
				flags[key] = true;
			}
		}
	}
	return flags;
}

/**
 * Normalize a raw read-excel-file cell value to a JSON-friendly primitive.
 * - Trims whitespace from strings.
 * - Converts empty strings to `null` so they can be omitted.
 * - Leaves numbers and booleans untouched.
 *
 * @param {unknown} value
 * @returns {unknown}
 */
function normalizeValue(value) {
	if (value === null || value === undefined) {
		return null;
	}

	if (typeof value === 'string') {
		const trimmed = value.trim();
		return trimmed === '' ? null : trimmed;
	}

	return value;
}

/**
 * Convert a sheet row array into an object and drop empty/null fields.
 *
 * @param {string[]} headers
 * @param {(unknown | null)[]} row
 * @returns {Record<string, unknown>}
 */
function rowToObject(headers, row) {
	/** @type {Record<string, unknown>} */
	const obj = {};
	headers.forEach((header, index) => {
		const cleaned = normalizeValue(row[index]);
		if (cleaned !== null) {
			obj[header] = cleaned;
		}
	});
	return obj;
}

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

	await writeFile(outputPath, JSON.stringify(records, null, '\t') + '\n', 'utf-8');
	console.log(`Wrote ${outputPath}`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
