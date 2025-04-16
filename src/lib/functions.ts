export const addFlagToCountry = (/** @type {string} */ country: string) => {
	return `${country} <span style="background-image: url(https://github.com/stefangabos/world_countries/blob/master/data/flags/16x16/${country.toLowerCase()}.png?raw=true);" class="flag"></span>`;
};

import { selectedImagePath } from './stores.svelte.js';
export const setGenusAndSpeciesItalic = (input: string, genus: string, species: string) => {
	return input.replace(
		new RegExp(`${genus.replaceAll('?', '')}|${species.replaceAll('?', '')}`, 'g'),
		`<span class="italic">$&</span>`
	);
};

export const openLightbox = (/** @type {any} */ src: string) => {
	selectedImagePath.path = src;
};
export const closeLightbox = (): void => {
	selectedImagePath.path = '';
};
