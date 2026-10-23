/**
 * Helpers for checking which catalog numbers have an image on the UB IIIF server.
 */

const IMAGE_API = 'https://iiif.ub.unibe.ch/image/v3.0/boga';
const RETRIES = 3;
const REQUEST_TIMEOUT = 60 * 1000;

/** Values of the `Image` field; `IMAGE_MISSING` must match `src/lib/functions.ts`. */
export const IMAGE_AVAILABLE = 'available';
export const IMAGE_MISSING = 'not available';

/**
 * Whether the image exists: the server redirects `<id>.tif/info.json` to the image's
 * UUID-based info.json if it does and answers 404 if it doesn't.
 *
 * @param {string} id
 * @returns {Promise<boolean>}
 */
async function hasImage(id) {
	const url = `${IMAGE_API}/${encodeURIComponent(id)}.tif/info.json`;
	for (let attempt = 1; ; attempt++) {
		try {
			const res = await fetch(url, {
				method: 'HEAD',
				redirect: 'manual',
				signal: AbortSignal.timeout(REQUEST_TIMEOUT)
			});
			if (res.status === 404) return false;
			if (res.status >= 200 && res.status < 400) return true;
			throw new Error(`HTTP ${res.status}`);
		} catch (error) {
			if (attempt >= RETRIES) throw new Error(`${url}: ${error.message}`, { cause: error });
		}
	}
}

/**
 * Check the given catalog numbers against the IIIF Image API.
 * Ids whose check keeps failing count as having an image, so the frontend rather shows the
 * camera icon once too often than hides it wrongly.
 *
 * @param {Iterable<string>} ids
 * @param {{ concurrency?: number }} [options]
 * @returns {Promise<Set<string>>} the ids that have an image
 */
export async function checkImages(ids, { concurrency = 16 } = {}) {
	const queue = [...new Set(ids)].filter(Boolean);
	const total = queue.length;
	const withImage = new Set();
	let done = 0;
	let failed = 0;

	console.log(`Checking ${total} ids on the IIIF server ...`);

	const worker = async () => {
		while (queue.length > 0) {
			const id = queue.shift();
			try {
				if (await hasImage(id)) withImage.add(id);
			} catch (error) {
				console.warn(`  warning: ${error.message}`);
				withImage.add(id);
				failed++;
			}
			done++;
			if (done % 1000 === 0) console.log(`  ${done}/${total} checked`);
		}
	};

	await Promise.all(Array.from({ length: concurrency }, worker));

	if (failed > 0) {
		console.warn(`${failed} id(s) could not be checked and are assumed to have an image.`);
	}
	return withImage;
}
