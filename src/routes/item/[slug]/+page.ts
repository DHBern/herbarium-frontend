import itemDataRaw from '$lib/data.json';
import structure from '$lib/structure.json';

export async function load({ params, fetch }) {
	interface Item {
		Genus: string;
		Species:string;
		Accepted_Name:string;
		Type:string;
		Catalog_Number: string;
	}
  
	const itemData: Item[] = Array.isArray(itemDataRaw) ? itemDataRaw : [];
	const item = itemData.find((item) => item.Catalog_Number === params.slug);

	console.log("Item:", item?.Catalog_Number);

	return {
		key: params.slug,
		metadata: item,
		iiif:
			(await fetch(
				`https://iiif.ub.unibe.ch/image/v3/boga/${item?.Catalog_Number}.tif/info.json`
			).then((res) => res.ok ? res.json() : false)) ?? false,
		structure
	};
}

export function entries() {
	return Array.isArray(itemDataRaw) ? itemDataRaw.map((item) => ({
		slug: item.Catalog_Number.replace('/', '')
	})) : [];
}
