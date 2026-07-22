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
		const Content = (await import(`$lib/collections/${collection}/content.md`)).default;
		const items: unknown[] = (await import(`$lib/collections/${collection}/data.json`)).default;

		return { ...loadCollection(structure, items), Content } as CollectionPageData;
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
