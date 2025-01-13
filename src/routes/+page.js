import itemData from '$lib/data.json';
import structure from '$lib/structure.json';

/** @type {import('./$types').PageLoad} */
export async function load() {
	const returnitems = itemData
		// @ts-ignore
		.map((item) => {
			const obj = {};
			for (const key in item) {
				if (key !== 'ImageGUID') {
					// @ts-ignore
					obj[key] = item[key];
				}
			}
			if (!obj.genus) {
				obj.genus = 'no genus';
			}
			return obj;
		})
		// @ts-ignore
		.sort((a, b) => {
			if (a.genus < b.genus) return -1;
			if (a.genus > b.genus) return 1;
			if (a.specificEpithet < b.specificEpithet) return -1;
			if (a.specificEpithet > b.specificEpithet) return 1;
			return 0;
		});

	return {
		// @ts-ignore
		categories: Object.keys(itemData[0]),
		itemstructure: structure,
		items: returnitems
	};
}
