import type { ItemStructure, Item } from '../../../types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	let structure: ItemStructure[] = [];
	if (params.collection === 'main') {
		structure = (await import(`$lib/structure.json`)).default;
	} else {
		console.log('fetching ', params.collection);
		structure = (await import(`$lib/collections/${params.collection}/structure.json`)).default;
	}
	let itemDataRaw: Item[] = [];
	if (params.collection === 'main') {
		itemDataRaw = (await import(`$lib/data.json`)).default;
	} else {
		itemDataRaw = (await import(`$lib/collections/${params.collection}/data.json`)).default;
	}
	const itemData = Array.isArray(itemDataRaw) ? itemDataRaw : [];
	const idKey = structure.find((s) => s.id)?.key ?? structure[0]?.key;
	const item = itemData.find((item) => item[idKey] === params.slug);

	return {
		key: params.slug,
		metadata: item,
		iiif:
			(await fetch(`https://iiif.ub.unibe.ch/image/v3/boga/${item?.[idKey]}.tif/info.json`).then(
				(res) => (res.ok ? res.json() : false)
			)) ?? false,
		structure
	};
};

// export function entries() {
// 	return Array.isArray(itemDataRaw)
// 		? itemDataRaw.map((item) => ({
// 				slug: item.Catalog_Number.replace('/', '')
// 			}))
// 		: [];
// }
