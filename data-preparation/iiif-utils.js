/**
 * Helpers for inventorying catalog numbers on the UB IIIF Presentation API.
 */

const COLLECTION_URL = 'https://iiif.ub.unibe.ch/presentation/v3.0/boga/collection/herbarium';
const RETRIES = 3;
const REQUEST_TIMEOUT = 60 * 1000;
const CONCURRENCY = 16;
// Catalog numbers of the main herbarium (input.xlsx); manifests labelled like this need no fetch.
const MAIN_ID = /^(BERN|Sheet|BOX)-/;
let inventory;

/** Values of the `Image` field; `IMAGE_MISSING` must match `src/lib/functions.ts`. */
export const IMAGE_AVAILABLE = 'available';
export const IMAGE_MISSING = 'not available';

async function fetchResource(url, signal) {
	for (let attempt = 1; ; attempt++) {
		try {
			const res = await fetch(url, {
				signal: AbortSignal.any([signal, AbortSignal.timeout(REQUEST_TIMEOUT)])
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return await res.json();
		} catch (error) {
			if (signal.aborted) throw error;
			if (attempt >= RETRIES) throw new Error(`${url}: ${error.message}`, { cause: error });
			console.warn(`  warning: ${url}: ${error.message}; retrying (${attempt}/${RETRIES})`);
		}
	}
}

function labelIds(resource) {
	const labels = Object.values(resource.label ?? {}).flat();
	if (labels.length === 0 || labels.some((label) => typeof label !== 'string' || !label.trim())) {
		throw new Error(`Missing or invalid IIIF label: ${resource.id}`);
	}
	return new Set(
		labels.map((label) =>
			label
				.trim()
				.replace(/\/+$/, '')
				.split('/')
				.pop()
				.replace(/\.(tiff?|jpe?g|png)$/i, '')
		)
	);
}

async function loadInventory() {
	const ids = new Set();
	const visited = new Set();
	const queue = [];
	const pending = new Map();
	const active = new Map();
	const controller = new AbortController();
	const started = Date.now();
	let completed = 0;
	console.log('Reading the IIIF Presentation API inventory ...');

	const enqueue = (resource) => {
		if (typeof resource.id !== 'string' || !resource.id) {
			throw new Error('IIIF resource without an id.');
		}
		if (visited.has(resource.id)) return;
		visited.add(resource.id);
		queue.push(resource);
	};

	const visit = async (reference) => {
		const resource = await fetchResource(reference.id, controller.signal);
		if (resource.type !== reference.type || !Array.isArray(resource.items)) {
			throw new Error(`Invalid IIIF ${reference.type}: ${reference.id}`);
		}
		if (resource.type === 'Manifest') {
			for (const canvas of resource.items) {
				if (canvas.type !== 'Canvas') throw new Error(`Invalid canvas in ${resource.id}`);
				for (const id of labelIds(canvas)) ids.add(id);
			}
		} else {
			// Follow only children, never partOf (which points back to the parent).
			for (const child of resource.items) {
				if (child.type === 'Collection') {
					enqueue(child);
				} else if (child.type === 'Manifest') {
					const names = labelIds(child);
					for (const id of names) ids.add(id);
					// Manifest labels already are the catalog number (including for multi-image
					// specimens) or, for display panels, the panel id "009b". Main-herbarium
					// manifests are not opened; other manifests also contribute their canvas
					// filenames (e.g. the image id "demo_9b").
					if (![...names].every((id) => MAIN_ID.test(id))) enqueue(child);
				} else {
					throw new Error(`Unexpected IIIF child type "${child.type}" in ${resource.id}`);
				}
			}
		}
		completed++;
	};

	const progress = setInterval(() => {
		const now = Date.now();
		console.log(
			`  ${Math.round((now - started) / 1000)}s: ${completed}/${visited.size} resources read, ` +
				`${active.size} active, ${queue.length} queued, ${ids.size} identifiers`
		);
		for (const [url, since] of [...active].slice(0, 3)) {
			console.log(`    waiting ${Math.round((now - since) / 1000)}s: ${url}`);
		}
	}, 10_000);

	try {
		enqueue({ id: COLLECTION_URL, type: 'Collection' });
		while (queue.length > 0 || pending.size > 0) {
			while (queue.length > 0 && pending.size < CONCURRENCY) {
				const reference = queue.shift();
				active.set(reference.id, Date.now());
				const task = visit(reference)
					.then(
						() => ({ id: reference.id }),
						(error) => ({ id: reference.id, error })
					)
					.finally(() => active.delete(reference.id));
				pending.set(reference.id, task);
			}
			if (pending.size > 0) {
				const result = await Promise.race(pending.values());
				pending.delete(result.id);
				if ('error' in result) throw result.error;
			}
		}
	} finally {
		clearInterval(progress);
		controller.abort();
		await Promise.allSettled(pending.values());
	}
	console.log(`Found ${ids.size} IIIF identifiers.`);
	return ids;
}

export async function checkImages(ids, { warnMissing = false, inputName = 'input.xlsx' } = {}) {
	const inputIds = new Set(ids);
	const available = await (inventory ??= loadInventory());
	if (warnMissing) {
		const missing = [...available].filter((id) => MAIN_ID.test(id) && !inputIds.has(id)).sort();
		for (const id of missing) {
			console.warn(`  warning: IIIF catalog number ${id} is not in ${inputName}`);
		}
		if (missing.length > 0) {
			console.warn(`${missing.length} IIIF catalog number(s) not found in ${inputName}.`);
		}
	}
	return new Set([...inputIds].filter((id) => available.has(id)));
}
