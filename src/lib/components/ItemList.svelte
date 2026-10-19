<script lang="ts">
	import { resolve } from '$app/paths';
	import { addFlagToCountry, setGenusAndSpeciesItalic } from '#lib/functions.js';
	import { resultNavigation } from '#lib/stores.svelte.js';
	import { blur, fly } from 'svelte/transition';
	let { items = $bindable([]), structure = [], collection = '' } = $props();

	let intersectionObserver: any;

	// hand the current result order to the detail page for its prev/next navigation
	const setResultNavigation = () => {
		resultNavigation.collection = collection || 'main';
		resultNavigation.ids = items.map((item) => item[idKey]);
	};

	function ensureIntersectionObserver() {
		if (intersectionObserver) return;
		intersectionObserver = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.target.tagName === 'THEAD') {
					if (entry.isIntersecting) {
						showHelperElements = false;
					} else if (entry.boundingClientRect.top < window.innerHeight / 2) {
						showHelperElements = true;
					}
				} else {
					if (entry.isIntersecting) {
						if (visibleNumber < items.length) {
							visibleNumber += 30;
							intersectionObserver.unobserve(entry.target);
						}
					}
				}
			});
		});
	}

	function viewport(element: any, abort: any) {
		// we only want the observer on the last Element, so we abort all but the last one i !== visibleItems.length - 1
		if (abort) return;
		ensureIntersectionObserver();

		intersectionObserver.observe(element);

		return {
			destroy() {
				intersectionObserver.unobserve(element);
			}
		};
	}

	let lastSortKey: string | null = $state(null);
	let sortOrder: 'asc' | 'desc' = $state('asc');
	let sortedItems: unknown = null;
	// a new list from the parent (e.g. a new search) arrives unsorted, so it has no sort key
	let sortKey = $derived(items === sortedItems ? lastSortKey : null);

	const sort = (key: string, order: 'asc' | 'desc') => {
		const direction = order === 'asc' ? 1 : -1;
		items = items.sort((a, b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0) * direction);
		sortedItems = items;
	};

	// cycles each column through asc → desc → default order (by score, or catalog number)
	const handleSort = (key: string) => {
		if (sortKey !== key) {
			lastSortKey = key;
			sortOrder = 'asc';
		} else if (sortOrder === 'asc') {
			sortOrder = 'desc';
		} else {
			lastSortKey = null;
		}

		if (lastSortKey) sort(lastSortKey, sortOrder);
		else sort(items[0] && 'score' in items[0] ? 'score' : 'Catalog_Number', 'desc');
	};
	let visibleNumber = $state(30);

	let showHelperElements = $state(false);
	let table: any = $state();
	let tableWidth = $state(0);
	let clientWidth = $state(0);
	let scrollLeft = $state(0);
	let trackWidth = $state(0);
	let hasOverflow = $derived(tableWidth > clientWidth + 1);
	let maxScroll = $derived(tableWidth - clientWidth);
	let thumbWidth = $derived(Math.max((trackWidth * clientWidth) / tableWidth, 40));
	let thumbTravel = $derived(trackWidth - thumbWidth);
	let thumbLeft = $derived(maxScroll > 0 ? (scrollLeft / maxScroll) * thumbTravel : 0);

	// custom top scrollbar (native overlay scrollbars, e.g. in Firefox, stay hidden until scrolled)
	let drag: { startX: number; startScroll: number } | null = null;

	const onThumbPointerDown = (event: PointerEvent) => {
		event.stopPropagation();
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		drag = { startX: event.clientX, startScroll: table.scrollLeft };
	};

	const onThumbPointerMove = (event: PointerEvent) => {
		if (!drag || thumbTravel <= 0) return;
		table.scrollLeft = drag.startScroll + ((event.clientX - drag.startX) * maxScroll) / thumbTravel;
	};

	const onThumbPointerUp = () => {
		drag = null;
	};

	const onTrackPointerDown = (event: PointerEvent) => {
		// jump so that the thumb is centered on the clicked position
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const target = event.clientX - rect.left - thumbWidth / 2;
		table.scrollTo({ left: (target / thumbTravel) * maxScroll, behavior: 'smooth' });
	};

	let idKey = $derived(structure.find((s) => s.id)?.key ?? null);
	let visibleCategories = $derived(structure.filter((s) => s.showInList));
	let visibleItems = $derived(items.slice(0, visibleNumber));
</script>

{#if hasOverflow}
	<div
		class="relative mb-1 h-3 cursor-pointer rounded-full bg-primary-100"
		bind:clientWidth={trackWidth}
		onpointerdown={onTrackPointerDown}
		aria-hidden="true"
	>
		<div
			class="absolute top-0 h-full cursor-grab touch-none rounded-full bg-primary-500 hover:bg-primary-700 active:cursor-grabbing"
			style:width="{thumbWidth}px"
			style:left="{thumbLeft}px"
			onpointerdown={onThumbPointerDown}
			onpointermove={onThumbPointerMove}
			onpointerup={onThumbPointerUp}
			onpointercancel={onThumbPointerUp}
			aria-hidden="true"
		></div>
	</div>
{/if}
<div
	class="table-wrap"
	bind:this={table}
	bind:clientWidth
	onscroll={() => (scrollLeft = table.scrollLeft)}
>
	{#if showHelperElements}
		<button
			class="btn-icon preset-tonal-primary fixed top-24 right-6 z-50"
			onclick={() => {
				table.scrollIntoView({ behavior: 'smooth' });
			}}
			aria-label="Scroll to top of table"
			in:fly={{ x: 100 }}
			out:blur
		>
			<i class="fa-solid fa-arrows-up-to-line"></i>
		</button>
	{/if}
	<table class="table whitespace-nowrap bg-primary-100" bind:offsetWidth={tableWidth}>
		<thead use:viewport={false} class="border-primary-800/20 bg-primary-400">
			<tr>
				{#each visibleCategories as { key, label }}
					<th class="w-0 cursor-pointer text-surface-950" onclick={() => handleSort(key)}>
						{label}
						<i
							class={[
								'fa-solid',
								sortKey !== key ? 'fa-sort' : sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down'
							]}
						></i>
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each visibleItems as row, i (row[idKey])}
				<tr
					class="border-primary-800/20 even:bg-primary-400/30"
					use:viewport={i !== visibleItems.length - 1}
				>
					{#each visibleCategories as { key }, j}
						<td class={['w-0', j === 0 && 'italic']}>
							{#if j === 0}<i class="fa-solid fa-camera"></i>{/if}
							{#if row[key]}
								<a
									href={resolve('/item/[collection]/[slug]', {
										collection: collection || 'main',
										slug: row[idKey]
									})}
									onclick={setResultNavigation}
								>
									{#if key === 'Country'}
										{@html addFlagToCountry(row[key])}
									{:else if key === 'Genus' || key === 'Species'}
										<span class="italic">{row[key]}</span>
									{:else if key === 'Accepted_Name'}
										{@html setGenusAndSpeciesItalic(row[key], row.Genus, row.Species)}
									{:else}
										{row[key]}
									{/if}
								</a>
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
