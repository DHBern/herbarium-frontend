<script lang="ts">
    import ContentContainer from '$lib/components/ContentContainer.svelte';
	import { onMount } from 'svelte';
	import { assets, base } from '$app/paths';
	import { addFlagToCountry, setGenusAndSpeciesItalic } from '$lib/functions';
	import type { Viewer } from 'openseadragon'
	let OpenSeadragon;
	let viewer: Viewer | undefined = $state();
	let { data } = $props();
	onMount(async () => {
		console.log(assets);
		OpenSeadragon = (await import('openseadragon')).default;
		viewer = new OpenSeadragon.Viewer({
			id: 'viewer',
			prefixUrl: `${assets}/openseadragon-svg-icons/icons/`,
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
		if (data.iiif) {
		viewer.open(data.iiif);
		}
	});

</script>

<svelte:head>
	<link rel="preconnect" href="https://iiif.ub.unibe.ch" />
</svelte:head>

<ContentContainer>
	<div class="grid md:grid-cols-2 md:grid-rows-[auto_1fr] gap-4 lg:gap-6"> 
		{#if data.metadata}
			{@const d = data.metadata}
			<div class="md:col-span-2 lg:col-span-1 lg:col-start-2">
				<h1 class="h1 text-balance pb-2 md:pb-4 inline italic">
					{#if d.Genus.trim() || d.Species.trim()}
						{d.Genus}
						{d.Species}
					{:else}
						{d.Accepted_Name}
					{/if}

					{#if d.Type !== 'no'}
						<span class="badge variant-filled-warning"> {d.Type}</span>
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
							<a class="anchor" href={`${base}/?a=${JSON.stringify({ [key]: metadataVal })}`}>
								{#if key === 'Country'}
									{@html addFlagToCountry(metadataVal)}
								{:else if key === 'Genus' || key === 'Species'}
									<span class="italic">{metadataVal}</span>
								{:else if key === 'Accepted_Name'}
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
