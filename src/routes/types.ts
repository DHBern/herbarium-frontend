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
    showInList: boolean;
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