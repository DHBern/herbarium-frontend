<script lang="ts">
	import ContentContainer from '$lib/components/ContentContainer.svelte';
	import { onMount } from 'svelte';
	import { asset, resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { addFlagToCountry, setGenusAndSpeciesItalic } from '$lib/functions.js';
	import { resultNavigation } from '$lib/stores.svelte';
	import type { Viewer } from 'openseadragon';
	let OpenSeadragon;
	let viewer: Viewer | undefined = $state();
	let { data } = $props();

	let collection = $derived(page.params.collection);
	let slug = $derived(page.params.slug);
	let navActive = $derived(
		resultNavigation.collection === collection && resultNavigation.ids.length > 0
	);
	let currentIndex = $derived(navActive ? resultNavigation.ids.indexOf(slug) : -1);
	let prevSlug = $derived(currentIndex > 0 ? resultNavigation.ids[currentIndex - 1] : null);
	let nextSlug = $derived(
		currentIndex >= 0 && currentIndex < resultNavigation.ids.length - 1
			? resultNavigation.ids[currentIndex + 1]
			: null
	);

	function goToItem(targetSlug: string) {
		goto(resolve('/item/[collection]/[slug]', { collection, slug: targetSlug }));
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!navActive) return;
		const viewerElement = document.getElementById('viewer');
		if (viewerElement && document.activeElement && viewerElement.contains(document.activeElement)) {
			return;
		}
		if (event.key === 'ArrowLeft' && prevSlug) {
			event.preventDefault();
			goToItem(prevSlug);
		} else if (event.key === 'ArrowRight' && nextSlug) {
			event.preventDefault();
			goToItem(nextSlug);
		}
	}
	onMount(async () => {
		OpenSeadragon = (await import('openseadragon')).default;
		viewer = new OpenSeadragon.Viewer({
			id: 'viewer',
			prefixUrl: asset('/openseadragon-svg-icons/icons/'),
			showNavigator: true,
			navImages: {
				zoomIn: {
					REST: 'zoomin_rest.svg',
					GROUP: 'zoomin_grouphover.svg',
					HOVER: 'zoomin_hover.svg',
					DOWN: 'zoomin_pressed.svg'
				},
				next: {
					REST: 'next_rest.svg',
					GROUP: 'next_grouphover.svg',
					HOVER: 'next_hover.svg',
					DOWN: 'next_pressed.svg'
				},
				previous: {
					REST: 'previous_rest.svg',
					GROUP: 'previous_grouphover.svg',
					HOVER: 'previous_hover.svg',
					DOWN: 'previous_pressed.svg'
				},
				fullpage: {
					REST: 'fullpage_rest.svg',
					GROUP: 'fullpage_grouphover.svg',
					HOVER: 'fullpage_hover.svg',
					DOWN: 'fullpage_pressed.svg'
				},
				home: {
					REST: 'home_rest.svg',
					GROUP: 'home_grouphover.svg',
					HOVER: 'home_hover.svg',
					DOWN: 'home_pressed.svg'
				},
				zoomOut: {
					REST: 'zoomout_rest.svg',
					GROUP: 'zoomout_grouphover.svg',
					HOVER: 'zoomout_hover.svg',
					DOWN: 'zoomout_pressed.svg'
				},
				rotateleft: {
					REST: 'rotateleft_rest.svg',
					GROUP: 'rotateleft_grouphover.svg',
					HOVER: 'rotateleft_hover.svg',
					DOWN: 'rotateleft_pressed.svg'
				},
				rotateright: {
					REST: 'rotateright_rest.svg',
					GROUP: 'rotateright_grouphover.svg',
					HOVER: 'rotateright_hover.svg',
					DOWN: 'rotateright_pressed.svg'
				},
				flip: {
					REST: 'flip_rest.svg',
					GROUP: 'flip_grouphover.svg',
					HOVER: 'flip_hover.svg',
					DOWN: 'flip_pressed.svg'
				}
			},
			sequenceMode: false
		});
	});

	$effect(() => {
		if (viewer && data.iiif) {
			viewer.open(data.iiif);
		}
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://iiif.ub.unibe.ch" />
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<ContentContainer>
	<div class="grid md:grid-cols-2 md:grid-rows-[auto_1fr] gap-4 lg:gap-6">
		{#if data.metadata}
			{@const d = data.metadata}
			<div class="md:col-span-2 lg:col-span-1 lg:col-start-2">
				{#if navActive}
					<div class="md:col-span-2 lg:col-span-1 lg:col-start-2 flex items-center gap-3">
						<button
							class="btn-icon preset-tonal-primary"
							disabled={!prevSlug}
							onclick={() => prevSlug && goToItem(prevSlug)}
							aria-label="Previous result"
						>
							<i class="fa-solid fa-arrow-left"></i>
						</button>
						<span class="text-sm font-medium"
							>{currentIndex + 1} / {resultNavigation.ids.length}</span
						>
						<button
							class="btn-icon preset-tonal-primary"
							disabled={!nextSlug}
							onclick={() => nextSlug && goToItem(nextSlug)}
							aria-label="Next result"
						>
							<i class="fa-solid fa-arrow-right"></i>
						</button>
					</div>
				{/if}
				<h1 class="h1 text-balance pb-2 md:pb-4 inline italic">
					{#if d?.Genus?.trim() || d?.Species?.trim()}
						{d.Genus}
						{d.Species}
					{:else if d?.Accepted_Name?.trim()}
						{d.Accepted_Name}
					{:else}
						{d['Label Name']}
					{/if}

					{#if d.Type && d.Type !== 'no'}
						<span class="badge preset-filled-warning-500"> {d.Type}</span>
					{/if}
				</h1>
			</div>
			<div
				class="lg:row-span-2 lg:row-start-1 w-full h-fit {d.Type !== 'no'
					? 'bg-warning-300'
					: 'bg-primary-900'}"
			>
				<div id="viewer" class="w-full h-[60vh]"></div>
			</div>
			<dl class="grid grid-cols-[1fr_3fr] justify-between h-fit">
				{#each data.structure as { label, key }}
					{@const metadataVal = (d as Record<string, any>)[key]}
					{#if metadataVal}
						<dt class="border-r-4 border-current pr-4 pt-4">
							{label}
						</dt>

						<dd class="pl-2 pt-4">
							<a class="anchor" href={resolve(`/?a=${JSON.stringify({ [key]: metadataVal })}`, {})}>
								{#if key === 'Country'}
									{@html addFlagToCountry(metadataVal)}
								{:else if key === 'Genus' || key === 'Species'}
									<span class="italic">{metadataVal}</span>
								{:else if key === 'Accepted_Name' || key === 'Label_Name'}
									{@html setGenusAndSpeciesItalic(metadataVal, d.Genus, d.Species)}
								{:else}
									{metadataVal}
								{/if}
							</a>
						</dd>
					{/if}
				{/each}
			</dl>
			<small>
				The images of our herbarium specimens are published under the licence CC BY 4.0. Please cite
				as: “by Herbarium Bernense / CC BY 4.0.”
			</small>
			<p>
				Found an error? Please contact <a
					class="anchor"
					href="mailto:katja.rembold@unibe.ch"
					target="_blank">Katja Rembold</a
				>
			</p>
		{/if}
	</div>
</ContentContainer>
