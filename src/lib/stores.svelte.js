
// @ts-ignore
import { writable } from 'svelte/store';

export const miniSearch = writable();

export const biggerPicture = writable();

export const selectedImagePath = $state({path: ''});

