import { error } from '@sveltejs/kit';
import { loadCollection } from '$lib/collectionLoad';
import type { CollectionPageData, ItemStructure } from '../../types';
import type { PageLoad, EntryGenerator } from './$types';

export const load: PageLoad = async ({ params }) => {
	const { collection } = params;

	try {
		const structure: ItemStructure[] = (await import(`../${collection}/structure.json`)).default;
		const Content = (await import(`../${collection}/content.md`)).default;
		const items: unknown[] = (await import(`$lib/collections/${collection}.json`)).default;

		return loadCollection(collection, structure, Content, items);
	} catch (err) {
		console.error(`Failed to load collection "${collection}":`, err);
		error(404, `Collection "${collection}" not found.`);
	}
};

export const entries: EntryGenerator = () => {
	const files = import.meta.glob('../**/structure.json', { eager: true });
	const slugs = Object.keys(files)
		.map((path) => path.match(/\.\.\/(?<slug>[^/]+)\/structure\.json$/)?.groups?.slug)
		.filter((slug): slug is string => typeof slug === 'string' && slug !== '');

	return slugs.map((slug) => ({ collection: slug }));
};

export const prerender = true;
