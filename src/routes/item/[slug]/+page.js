import itemData from '$lib/data.json';
import structure from '$lib/structure.json';

export async function load({ params, fetch }) {
	// @ts-ignore
	const item = itemData.find((item) => item.materialEntityID === params.slug);

	return {
		key: params.slug,
		metadata: item,
		iiif:
			(await fetch(
				`https://iiif.ub.unibe.ch/image/v3/boga/${item?.['materialEntityID']}.tif/info.json`
			).then((res) => {
				return res.ok ? res.json() : false;
			})) ?? false,
		structure
	};
}
export function entries() {
	// @ts-ignore
	return itemData.map((item) => {
		return { slug: item.materialEntityID.replace('/', '') };
	});
}
