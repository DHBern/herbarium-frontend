import type {
	CollectionContent,
	CollectionInfo,
	CollectionStructure,
	CollectionUnit
} from '../routes/types';

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

const path = (slug: string, file: string) => `./collections/${slug}/${file}`;

async function resolveFeatured(file: unknown): Promise<string | undefined> {
	if (typeof file !== 'string') return undefined;
	const entry = Object.entries(enhancedImages).find(([p]) => p.endsWith(`/${file}`));
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

/** The items on one unit, in `Position` order (empty if the collection has no contents). */
export async function loadUnitContents(slug: string, unit: string) {
	const contents = (await contentsFiles[path(slug, 'contents.json')]?.()) ?? [];
	return contents
		.filter((item) => item.Unit === unit)
		.sort((a, b) => (a.Position ?? 0) - (b.Position ?? 0));
}
