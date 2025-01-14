import itemData from '$lib/data.json';
import structure from '$lib/structure.json';

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
	const item = itemData.find((item) => item.Catalog_Number === params.slug);

	return {
		key: params.slug,
		metadata: item,
		iiif:
			(await fetch(
				`https://iiif.ub.unibe.ch/image/v3/boga/${item?.['Catalog_Number']}.tif/info.json`
			).then((res) => {
				return res.ok ? res.json() : false;
			})) ?? false,
		structure
	};
}

/** @type {import('./$types').EntryGenerator} */
export function entries() {
	return itemData.map((item) => {
		return { slug: item.Catalog_Number.replace('/', '') };
	});
}
