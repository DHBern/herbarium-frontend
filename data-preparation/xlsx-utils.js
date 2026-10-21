/**
 * Helpers shared by the XLSX → JSON conversion scripts.
 */

/**
 * Parse simple CLI flags of the form `--key value` or `--key=value`.
 * @returns {Record<string, string | boolean>}
 */
export function parseArgs() {
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
export function normalizeValue(value) {
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
export function rowToObject(headers, row) {
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

/**
 * Convert the rows of one worksheet (first row = headers) into objects.
 *
 * @param {unknown[][]} rows
 * @returns {Record<string, unknown>[]}
 */
export function sheetToObjects(rows) {
	if (!Array.isArray(rows) || rows.length === 0) return [];
	const headers = rows[0].map((header) => String(header ?? '').trim());
	return rows
		.slice(1)
		.map((row) => rowToObject(headers, row))
		.filter((record) => Object.keys(record).length > 0);
}
