import { listCollections } from '#lib/collection-data.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const collections = (await listCollections()).filter((c) => !c.hidden);
	return { collections };
};

export const prerender = true;
