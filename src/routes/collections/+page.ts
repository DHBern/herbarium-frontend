import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const files = import.meta.glob('./**/structure.json', { eager: true });
	const collections = Object.keys(files)
		.map((path) => path.match(/\.\/(?<slug>[^/]+)\/structure\.json$/)?.groups?.slug)
		.filter((slug): slug is string => typeof slug === 'string' && slug !== '');

	return { collections };
};

export const prerender = true;
