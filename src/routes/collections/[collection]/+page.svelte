<script lang="ts">
	import { resolve } from '$app/paths';
	import type { CollectionPageData } from '../../types';
	import { openLightbox } from '#lib/functions.js';
	import { resultNavigation } from '#lib/stores.svelte.js';
	import UnitThumbnail from '#lib/components/UnitThumbnail.svelte';
	import { unitImageId } from '#lib/collection-data.js';

	interface Props {
		data: CollectionPageData;
	}

	let { data }: Props = $props();
	const Content = $derived(data.Content);
	const featured = $derived(data.featured);

	// hand the unit order to the detail page for its prev/next navigation
	function setResultNavigation() {
		resultNavigation.collection = data.collection;
		resultNavigation.ids = data.units.map((unit) => unit.Catalog_Number);
	}
</script>

<section class="w-full my-8 container py-4 mx-auto px-4 flex flex-col md:flex-row gap-6">
	<div class="flex-1">
		<Content />
	</div>
	{#if featured}
		<enhanced:img
			src={featured}
			alt="featured"
			class="max-w-full md:max-w-96 h-fit border-8 border-primary-500 anchor cursor-pointer"
			onclick={(e: Event & { currentTarget: HTMLImageElement }) => {
				openLightbox(e.currentTarget.src);
			}}
			role="presentation"
		/>
	{/if}
</section>

<section class="container mx-auto px-4 mb-12">
	<p class="mb-4">{data.units.length} unit{data.units.length !== 1 ? 's' : ''}</p>
	<ul class="grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(10.5rem,1fr))] sm:gap-4">
		{#each data.units as unit (unit.Catalog_Number)}
			<li>
				<UnitThumbnail
					id={unit.Catalog_Number}
					imageId={unitImageId(unit)}
					title={unit.Unit_Title}
					sizes="auto, (min-width: 40rem) 12rem, calc(50vw - 2.25rem)"
					href={resolve('/item/[collection]/[slug]', {
						collection: data.collection,
						slug: unit.Catalog_Number
					})}
					onclick={setResultNavigation}
				/>
			</li>
		{/each}
	</ul>
</section>
