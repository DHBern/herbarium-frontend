import { error } from '@sveltejs/kit';
import { loadCollection, loadUnitContents } from '#lib/collection-data.js';
import { manifestUrl as buildManifestUrl } from '#lib/functions.js';
import type { ItemStructure, Item, CollectionContent } from '../../../types';
import type { PageLoad } from './$types';

async function loadMainItem(slug: string) {
	const structure = (await import(`#lib/structure.json`)).default as ItemStructure[];
	const itemDataRaw: Item[] = (await import(`#lib/data.json`)).default;
	const itemData = Array.isArray(itemDataRaw) ? itemDataRaw : [];
	const idKey = structure.find((s) => s.id)?.key ?? structure[0]?.key;
	const item = itemData.find((item) => item[idKey] === slug);
	return { metadata: item, id: item?.[idKey], structure };
}

async function loadCollectionItem(collection: string, slug: string) {
	const data = await loadCollection(collection);
	if (!data) error(404, `Collection "${collection}" not found.`);
	const unit = data.units.find((u) => u.Catalog_Number === slug);
	return {
		metadata: unit as Item | undefined,
		id: unit?.Catalog_Number,
		structure: data.structure.units,
		collectionTitle: data.title,
		contents: unit ? await loadUnitContents(collection, slug) : ([] as CollectionContent[]),
		contentsStructure: data.structure.contents ?? []
	};
}

export const load: PageLoad = async ({ params, fetch }) => {
	const item =
		params.collection === 'main'
			? await loadMainItem(params.slug)
			: await loadCollectionItem(params.collection, params.slug);

	const manifestUrl = item.id ? buildManifestUrl(String(item.id)) : undefined;
	const iiif = manifestUrl
		? await fetch(manifestUrl)
				.then((res) => (res.ok ? res.json() : false))
				.then((json) => {
					return json.items?.flatMap((canvas: any) => {
						return canvas.items?.flatMap((annotationPage: any) => {
							return annotationPage.items?.flatMap((annotation: any) => {
								if (annotation.body?.type === 'Image') {
									return annotation.body.service[0].id;
								}
								return [];
							});
						});
					});
				})
				.catch(() => false)
		: false;

	return {
		key: params.slug,
		iiif,
		manifestUrl,
		collectionTitle: undefined as string | undefined,
		contents: [] as CollectionContent[],
		contentsStructure: [] as ItemStructure[],
		...item
	};
};
