import { writable } from 'svelte/store';
import type MiniSearch from 'minisearch';

export const miniSearch = writable<MiniSearch>();
export const selectedImagePath = $state<{ path: string }>({ path: '' });
export const resultNavigation = $state<{ collection: string; ids: string[] }>({
	collection: '',
	ids: []
});
