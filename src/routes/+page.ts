import itemDataRaw from '$lib/data.json';
import structure from '$lib/structure.json';

/** @type {import('./$types').PageLoad} */
export async function load() {
	const itemData: Array<{ [key: string]: any }> = Array.isArray(itemDataRaw) ? itemDataRaw : [];

	const returnitems = itemData
		.map((item) => {
			const obj: { [key: string]: any } = {};
			for (const key in item) {
				if (key !== 'ImageGUID') {
					obj[key] = item[key];
				}
			}
			if (!obj.Genus) {
				obj.Genus = 'no genus';
			}
			return obj;
		})
		.sort((a, b) => {
			if (a.Genus < b.Genus) return -1;
			if (a.Genus > b.Genus) return 1;
			if (a.Species < b.Species) return -1;
			if (a.Species > b.Species) return 1;
			return 0;
		});

	return {
		categories: itemData.length > 0 ? Object.keys(itemData[0]) : [],
		itemstructure: structure,
		items: returnitems
	};
}
