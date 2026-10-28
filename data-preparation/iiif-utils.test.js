import assert from 'node:assert/strict';
import { test } from 'node:test';

const ROOT = 'https://iiif.ub.unibe.ch/presentation/v3.0/boga/collection/herbarium';
let moduleId = 0;

async function freshCheckImages() {
	return (await import(`./iiif-utils.js?test=${moduleId++}`)).checkImages;
}

function collection(id, items) {
	return { id, type: 'Collection', items };
}

function manifest(id, label) {
	return { id, type: 'Manifest', label: { none: [label] } };
}

test('inventories nested collections, grouped specimens and display panels once', async (t) => {
	const requests = [];
	const warnings = [];
	const resources = {
		[ROOT]: collection('canonical-root', [
			{ id: 'wet', type: 'Collection' },
			{ id: 'wet', type: 'Collection' },
			{ id: 'display', type: 'Collection' }
		]),
		wet: {
			...collection('wet', [
				manifest('grouped-specimen', '/herbarium/wet/BERN-B-00001122'),
				manifest('sheet', '/herbarium/herb-specs/sheets_00000/Sheet-0000005'),
				manifest('orphan-sheet', '/herbarium/herb-specs/sheets_00000/Sheet-9999999'),
				{
					...manifest('orphan', '/herbarium/wet/BERN-B-99999999'),
					label: {
						Default: ['/herbarium/wet/BERN-B-99999999'],
						de: ['/herbarium/wet/BERN-B-99999999']
					}
				},
				{ id: ROOT, type: 'Collection' }
			]),
			partOf: [{ id: 'never-follow-parent', type: 'Collection' }]
		},
		display: collection('display', [manifest('panel', '/herbarium/herb-demo/009b')]),
		panel: {
			...manifest('panel', '/herbarium/herb-demo/009b'),
			items: [
				{
					type: 'Canvas',
					label: { none: ['/herbarium/herb-demo/009b/demo_9b.jpg'] }
				}
			]
		}
	};
	t.mock.method(globalThis, 'fetch', async (url, options) => {
		requests.push(url);
		assert.ok(options.signal instanceof AbortSignal);
		assert.ok(resources[url], `Unexpected request: ${url}`);
		return Response.json(resources[url]);
	});
	t.mock.method(console, 'log', () => {});
	t.mock.method(console, 'warn', (message) => warnings.push(message));
	const checkImages = await freshCheckImages();

	const available = await checkImages(
		['BERN-B-00001122', 'Sheet-0000005', 'missing', '009b', '009b'],
		{ warnMissing: true, inputName: 'specimens.xlsx' }
	);
	assert.deepEqual([...available], ['BERN-B-00001122', 'Sheet-0000005', '009b']);
	assert.deepEqual(warnings, [
		'  warning: IIIF catalog number BERN-B-99999999 is not in specimens.xlsx',
		'  warning: IIIF catalog number Sheet-9999999 is not in specimens.xlsx',
		'2 IIIF catalog number(s) not found in specimens.xlsx.'
	]);
	assert.deepEqual(requests.sort(), [ROOT, 'wet', 'display', 'panel'].sort());

	const requestCount = requests.length;
	assert.deepEqual(await checkImages(['009b']), new Set(['009b']));
	assert.equal(requests.length, requestCount);
	assert.equal(warnings.length, 3);
});

test('retries HTTP, network and JSON failures before accepting the complete inventory', async (t) => {
	t.mock.method(console, 'log', () => {});
	const warnings = [];
	t.mock.method(console, 'warn', (message) => warnings.push(message));
	for (const failure of ['network', 'http', 'json']) {
		let attempts = 0;
		t.mock.method(globalThis, 'fetch', async () => {
			attempts++;
			if (attempts < 3) {
				if (failure === 'network') throw new Error('connection reset');
				if (failure === 'http') return new Response('unavailable', { status: 503 });
				return new Response('invalid json');
			}
			return Response.json(collection(ROOT, []));
		});
		const checkImages = await freshCheckImages();
		assert.deepEqual(await checkImages(['missing']), new Set());
		assert.equal(attempts, 3);
	}
	assert.equal(warnings.length, 6);
	assert.ok(warnings.every((message) => message.includes('retrying')));
});

test('aborts on a failed child instead of reporting a partial inventory as success', async (t) => {
	let attempts = 0;
	t.mock.method(console, 'log', () => {});
	t.mock.method(console, 'warn', () => {});
	t.mock.method(globalThis, 'fetch', async (url) => {
		if (url === ROOT) {
			return Response.json(
				collection(ROOT, [
					manifest('known', '/herbarium/wet/BERN-B-00001122'),
					{ id: 'broken-child', type: 'Collection' }
				])
			);
		}
		attempts++;
		return new Response('Not found', { status: 404 });
	});
	const checkImages = await freshCheckImages();
	await assert.rejects(checkImages(['BERN-B-00001122']), /broken-child: HTTP 404/);
	assert.equal(attempts, 3);
});

test('keeps processing queued requests while one request is slow', async (t) => {
	t.mock.method(console, 'log', () => {});
	let releaseSlow;
	const slow = new Promise((resolve) => {
		releaseSlow = resolve;
	});
	let lastStarted;
	const reachedLast = new Promise((resolve) => {
		lastStarted = resolve;
	});
	let active = 0;
	let peak = 0;
	t.mock.method(globalThis, 'fetch', async (url) => {
		if (url === ROOT) {
			return Response.json(
				collection(ROOT, [
					{ id: 'slow', type: 'Collection' },
					...Array.from({ length: 20 }, (_, i) => ({ id: `fast-${i}`, type: 'Collection' }))
				])
			);
		}
		active++;
		peak = Math.max(peak, active);
		if (url === 'slow') await slow;
		if (url === 'fast-19') lastStarted();
		active--;
		return Response.json(collection(url, []));
	});
	const checkImages = await freshCheckImages();
	const result = checkImages([]);
	let timeout;
	try {
		await Promise.race([
			reachedLast,
			new Promise((_, reject) => {
				timeout = setTimeout(() => reject(new Error('Queue stalled behind slow request')), 1000);
			})
		]);
		assert.ok(peak <= 16);
		assert.ok(active > 0, 'slow request must still be active');
	} finally {
		clearTimeout(timeout);
		releaseSlow();
		await result;
	}
});

test('prints progress and the active URL while a request is pending', async (t) => {
	const logs = [];
	t.mock.method(console, 'log', (message) => logs.push(message));
	t.mock.timers.enable({ apis: ['setInterval', 'Date'] });
	let release;
	t.mock.method(
		globalThis,
		'fetch',
		() =>
			new Promise((resolve) => {
				release = () => resolve(Response.json(collection(ROOT, [])));
			})
	);
	const checkImages = await freshCheckImages();
	const result = checkImages([]);
	t.mock.timers.tick(10_000);
	assert.ok(logs.some((message) => message.includes('10s: 0/1 resources read')));
	assert.ok(logs.some((message) => message.includes(`waiting 10s: ${ROOT}`)));
	release();
	await result;
	const count = logs.length;
	t.mock.timers.tick(10_000);
	assert.equal(logs.length, count, 'progress timer must be cleared');
});

test('propagates simultaneous failures and cancels other active requests', async (t) => {
	t.mock.method(console, 'log', () => {});
	t.mock.method(console, 'warn', () => {});
	let cancelled = 0;
	t.mock.method(globalThis, 'fetch', async (url, { signal }) => {
		if (url === ROOT) {
			return Response.json(
				collection(ROOT, [
					{ id: 'good', type: 'Collection' },
					{ id: 'bad', type: 'Collection' },
					{ id: 'pending', type: 'Collection' }
				])
			);
		}
		if (url === 'good') return Response.json(collection(url, []));
		if (url === 'bad') return Response.json({ type: 'Manifest', items: [] });
		return new Promise((_, reject) => {
			signal.addEventListener(
				'abort',
				() => {
					cancelled++;
					reject(signal.reason);
				},
				{ once: true }
			);
		});
	});
	const checkImages = await freshCheckImages();
	await assert.rejects(checkImages([]), /Invalid IIIF Collection: bad/);
	assert.equal(cancelled, 1);
});
test('rejects malformed collections, labels and children', async (t) => {
	t.mock.method(console, 'log', () => {});
	for (const resource of [
		{ type: 'Collection' },
		{ type: 'Manifest', items: [] },
		collection(ROOT, [{ id: 'missing-label', type: 'Manifest' }]),
		collection(ROOT, [{ id: 'unexpected', type: 'Canvas' }]),
		collection(ROOT, [{ type: 'Collection' }])
	]) {
		t.mock.method(globalThis, 'fetch', async () => Response.json(resource));
		const checkImages = await freshCheckImages();
		await assert.rejects(checkImages(['BERN-B-00001122']), /Invalid|Missing|Unexpected|without/);
	}
});
