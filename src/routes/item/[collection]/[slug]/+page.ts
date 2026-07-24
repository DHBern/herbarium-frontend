import type { ItemStructure, Item } from '../../../types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	let structure: ItemStructure[] = [];
	if (params.collection === 'main') {
		structure = (await import(`$lib/structure.json`)).default;
	} else {
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
	const iiif = await fetch(
		`https://iiif.ub.unibe.ch/presentation/v3.0/boga/manifest/${item?.[idKey]}/`
	)
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
		});

	return {
		key: params.slug,
		metadata: item,
		iiif,
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
