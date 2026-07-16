import type { CollectionPageData, Item, ItemStructure } from '../routes/types';

export function loadCollection(
	slug: string,
	structure: ItemStructure[],
	Content: typeof import('*.md').default,
	items: unknown[]
): CollectionPageData {
	const categories = structure.map((s) => s.key);

	const normalizedItems: Item[] = (Array.isArray(items) ? items : []).map((item) => {
		const record: Item = {};
		for (const { key } of structure) {
			record[key] = (item as Record<string, unknown>)?.[key] ?? '';
		}
		return record;
	});

	return {
		slug,
		structure,
		items: normalizedItems,
		categories,
		Content
	};
}
