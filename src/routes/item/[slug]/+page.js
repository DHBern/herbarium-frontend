import itemData from '$lib/data.json';
import structure from '$lib/structure.json';

export async function load({ params, fetch }) {
<<<<<<< HEAD
	// @ts-ignore
	const item = itemData.find((item) => item.materialEntityID === params.slug);
=======
	const item = itemData.find((item) => item.Catalog_Number === params.slug);
>>>>>>> 092fe1e31ad6966192336577df4e48be0f412ca1

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
export function entries() {
	// @ts-ignore
	return itemData.map((item) => {
		return { slug: item.Catalog_Number.replace('/', '') };
	});
}
