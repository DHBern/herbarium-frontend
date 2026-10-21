import { error } from '@sveltejs/kit';
import { listCollections, loadCollection } from '#lib/collection-data.js';
import type { CollectionPageData } from '../../types';
import type { PageLoad, EntryGenerator } from './$types';

export const load: PageLoad = async ({ params }): Promise<CollectionPageData> => {
	const collection = await loadCollection(params.collection);
	if (!collection) error(404, `Collection "${params.collection}" not found.`);
	return collection;
};

export const entries: EntryGenerator = async () =>
	(await listCollections()).map(({ slug }) => ({ collection: slug }));

export const prerender = true;
