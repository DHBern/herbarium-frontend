export interface SearchQuery {
	fields: string[];
	queries: string[];
}

export interface AdvancedSearch {
	combineWith: 'AND' | 'OR';
	queries: SearchQuery[];
}

export interface AdvancedFields {
	[key: string]: string;
}

export interface Item {
	[key: string]: any; // Replace with your actual item structure
}

export interface ItemStructure {
	key: string;
	label: string;
	showInList?: boolean;
	id?: boolean;
	filter?: 'simple' | 'advanced';
}

export interface PageData {
	categories: string[];
	items: Item[];
	itemstructure: ItemStructure[];
}

export interface MiniSearchOptions {
	fields: string[];
	storeFields: string[];
	idField: string;
	tokenize: (text: string) => string[];
	searchOptions: {
		fuzzy: boolean;
		prefix: boolean;
	};
}

export interface ResultNavigation {
	collection: string;
	ids: string[];
}

export interface CollectionUnit {
	Catalog_Number: string;
	Unit_Title: string;
	[key: string]: unknown;
}

export interface CollectionContent {
	Unit: string;
	Catalog_Number?: string;
	[key: string]: unknown;
}

export interface CollectionStructure {
	units: ItemStructure[];
	contents?: ItemStructure[];
}

export interface CollectionInfo {
	slug: string;
	title: string;
	hidden: boolean;
	featured?: string;
}

export interface CollectionPageData {
	collection: string;
	title: string;
	units: CollectionUnit[];
	structure: CollectionStructure;
	featured?: string;
	Content: typeof import('*.md').default;
}
