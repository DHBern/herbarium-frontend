import type {
	CollectionContent,
	CollectionInfo,
	CollectionStructure,
	CollectionUnit
} from '../routes/types';
import { thumbnailUrl } from '#lib/functions.js';

type Markdown = typeof import('*.md');

const contentFiles = import.meta.glob<Markdown>('./collections/*/content.md', { eager: true });
const structureFiles = import.meta.glob<CollectionStructure>('./collections/*/structure.json', {
	import: 'default'
});
const unitFiles = import.meta.glob<CollectionUnit[]>('./collections/*/units.json', {
	import: 'default'
});
const contentsFiles = import.meta.glob<CollectionContent[]>('./collections/*/contents.json', {
	import: 'default'
});
const enhancedImages = import.meta.glob<string>(
	'./assets/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp}',
	{ query: '?enhanced', import: 'default' }
);

const IMAGE_FILE = /\.(avif|gif|heif|jpeg|jpg|png|tiff|webp)$/i;

const path = (slug: string, file: string) => `./collections/${slug}/${file}`;

/**
 * `featured` front matter is either an image file in `src/lib/assets/` (e.g. `foo.jpg`) or an
 * Image API id (e.g. `demo_9b`), which resolves to its medium IIIF thumbnail.
 */
async function resolveFeatured(featured: unknown): Promise<string | undefined> {
	if (typeof featured !== 'string' || !featured.trim()) return undefined;
	const value = featured.trim();
	if (!IMAGE_FILE.test(value)) return thumbnailUrl(value, 'medium');
	const entry = Object.entries(enhancedImages).find(([p]) => p.endsWith(`/${value}`));
	return entry ? await entry[1]() : undefined;
}

/** All collections that have a `content.md`, sorted by title. */
export async function listCollections(): Promise<CollectionInfo[]> {
	const collections = await Promise.all(
		Object.entries(contentFiles).map(async ([p, { metadata }]) => {
			const slug = p.split('/')[2];
			return {
				slug,
				title: typeof metadata?.title === 'string' ? metadata.title : slug,
				hidden: metadata?.hidden === true,
				featured: await resolveFeatured(metadata?.featured)
			};
		})
	);
	return collections.sort((a, b) => a.title.localeCompare(b.title));
}

export function collectionExists(slug: string) {
	return path(slug, 'content.md') in contentFiles && path(slug, 'units.json') in unitFiles;
}

/** Content, config and units of one collection; `undefined` if it doesn't exist. */
export async function loadCollection(slug: string) {
	if (!collectionExists(slug)) return undefined;
	const { default: Content, metadata } = contentFiles[path(slug, 'content.md')];
	const [structure, units, featured] = await Promise.all([
		structureFiles[path(slug, 'structure.json')]?.() ?? { units: [] },
		unitFiles[path(slug, 'units.json')](),
		resolveFeatured(metadata?.featured)
	]);
	return {
		collection: slug,
		title: typeof metadata?.title === 'string' ? metadata.title : slug,
		Content,
		featured,
		structure,
		units
	};
}

/**
 * Image API id of a unit's thumbnail. Display herbarium panels have the manifest id `009b` but the
 * image id `demo_9b`; all other units use their `Catalog_Number` for both.
 */
export function unitImageId(unit: CollectionUnit) {
	const no = unit['Panel No'];
	const side = unit['Panel side'];
	if (no === undefined || side === undefined) return unit.Catalog_Number;
	return `demo_${Number(no)}${String(side).trim()}`;
}

/** The items on one unit, in sheet order (empty if the collection has no contents). */
export async function loadUnitContents(slug: string, unit: string) {
	const contents = (await contentsFiles[path(slug, 'contents.json')]?.()) ?? [];
	return contents.filter((item) => item.Unit === unit);
}
