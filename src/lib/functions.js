import { get } from 'svelte/store';
import { biggerPicture } from './stores';

export const addFlagToCountry = (/** @type {string} */ country) => {
	return `${country} <span style="background-image: url(https://github.com/stefangabos/world_countries/blob/master/data/flags/16x16/${country.toLowerCase()}.png?raw=true);" class="flag"></span>`;
};

export const setGenusAndSpeciesItalic = (
	/** @type {string} */ input,
	/** @type {string} */ genus,
	/** @type {string} */ species
) => {
	return input.replace(
		new RegExp(`${genus.replaceAll('?', '')}|${species.replaceAll('?', '').trimEnd()}`, 'g'),
		`<span class="italic">$&</span>`
	);
};

export const openLightbox = (/** @type {any} */ target) => {
	get(biggerPicture).open({
		// @ts-ignore
		items: {
			img: target.src,
			width: target.attributes.width.value,
			height: target.attributes.height.value
		}
	});
};
