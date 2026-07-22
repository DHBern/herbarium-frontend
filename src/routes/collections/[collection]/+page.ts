import { error } from '@sveltejs/kit';
import { type CollectionPageData, type Item, type ItemStructure } from '../../types';
import type { PageLoad, EntryGenerator } from './$types';

function loadCollection(structure: ItemStructure[], items: unknown[]) {
	const categories = structure.map((s) => s.key);

	const normalizedItems: Item[] = (Array.isArray(items) ? items : []).map((item) => {
		const record: Item = {};
		for (const { key } of structure) {
			record[key] = (item as Record<string, unknown>)?.[key] ?? '';
		}
		return record;
	});

	return {
		structure,
		items: normalizedItems,
		categories
	};
}

export const load: PageLoad = async ({ params }) => {
	const { collection } = params;

	try {
		const structure: ItemStructure[] = (
			await import(`$lib/collections/${collection}/structure.json`)
		).default;
		const mdsvexComponent = await import(`$lib/collections/${collection}/content.md`);
		const items: unknown[] = (await import(`$lib/collections/${collection}/data.json`)).default;

		const enhancedImages = import.meta.glob<{ default: string }>(
			'$lib/assets/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp}',
			{ query: '?enhanced' }
		);
		let featured: string | undefined;
		if (mdsvexComponent?.metadata?.featured) {
			const entry = Object.entries(enhancedImages).find(([path]) =>
				path.endsWith(`/${mdsvexComponent?.metadata?.featured}`)
			);
			featured = entry ? (await entry[1]()).default : undefined;
		}

		return {
			...loadCollection(structure, items),
			Content: mdsvexComponent.default,
			featured
		} as CollectionPageData;
	} catch (err) {
		console.error(`Failed to load collection "${collection}":`, err);
		error(404, `Collection "${collection}" not found.`);
	}
};

export const entries: EntryGenerator = () => {
	const files = import.meta.glob('../../lib/collections/**/structure.json', { eager: true });
	const slugs = Object.keys(files)
		.map((path) => path.match(/collections\/(?<slug>[^/]+)\/structure\.json$/)?.groups?.slug)
		.filter((slug): slug is string => typeof slug === 'string' && slug !== '');

	return slugs.map((slug) => ({ collection: slug }));
};

export const prerender = true;
