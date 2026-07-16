import { writable } from 'svelte/store';
import type MiniSearch from 'minisearch';

export const miniSearch = writable<MiniSearch>();
export const selectedImagePath = $state({ path: '' });
