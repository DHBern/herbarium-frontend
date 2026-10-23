export const addFlagToCountry = (country: string) => {
	return `${country} <span style="background-image: url(https://raw.githubusercontent.com/stefangabos/world_countries/refs/heads/master/data/flags/flat/16x12/${country.toLowerCase()}.png?raw=true);" class="flag"></span>`;
};

import { selectedImagePath } from './stores.svelte';
export const setGenusAndSpeciesItalic = (input: string, genus: string, species: string) => {
	return input.replace(
		new RegExp(`${genus.trim().replaceAll('?', '')}|${species.trim().replaceAll('?', '')}`, 'g'),
		`<span class="italic">$&</span>`
	);
};

const IIIF_BASE = 'https://iiif.ub.unibe.ch';

// value of the generated `Image` field for items without an image on the IIIF server;
// must match `IMAGE_MISSING` in data-preparation/iiif-utils.js
export const IMAGE_MISSING = 'not available';
export const IMAGE_AVAILABLE = 'available';

export const manifestUrl = (id: string) =>
	`${IIIF_BASE}/presentation/v3.0/boga/manifest/${encodeURIComponent(id)}/`;

export const thumbnailUrl = (id: string) =>
	`${IIIF_BASE}/image/boga/${encodeURIComponent(id)}.tif/thumbnail/1.webp`;

export const openLightbox = (src: string) => {
	selectedImagePath.path = src;
};
export const closeLightbox = (): void => {
	selectedImagePath.path = '';
};
