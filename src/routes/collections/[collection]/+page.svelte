<script lang="ts">
	import CollectionGrid from '$lib/components/CollectionGrid.svelte';
	import type { CollectionPageData } from '../../types';
	import { openLightbox } from '$lib/functions';

	interface Props {
		data: CollectionPageData;
	}

	let { data }: Props = $props();
	const Content = $derived(data.Content);
	const featured = $derived(data.featured);

	let selectedValues = $state<Record<string, string>>({});

	const filterableStructure = $derived(data.structure);

	const filterOptions = $derived.by(() => {
		const options: Record<string, string[]> = {};
		for (const { key } of filterableStructure) {
			const values: string[] = [];
			for (const item of data.items) {
				const value = item[key];
				if (value !== undefined && value !== null && String(value).trim() !== '') {
					const str = String(value);
					if (!values.includes(str)) {
						values.push(str);
					}
				}
			}
			options[key] = values.sort((a, b) => a.localeCompare(b));
		}
		return options;
	});

	const filteredItems = $derived.by(() => {
		const activeFilters = Object.entries(selectedValues).filter(([, value]) => value !== '');
		if (activeFilters.length === 0) return data.items;
		return data.items.filter((item) =>
			activeFilters.every(([key, value]) => String(item[key] ?? '') === value)
		);
	});

	function resetFilters() {
		selectedValues = {};
	}
</script>

<section class="w-full px-8 my-8 container py-4 mx-auto">
	{#if featured}
		<enhanced:img
			src={featured}
			alt="featured"
			class="max-w-full md:max-w-96 mx-auto mt-4 md:my-4 md:mr-6 border-8 border-primary-500 anchor cursor-pointer"
			onclick={(e: Event & { currentTarget: HTMLImageElement }) => {
				openLightbox(e.currentTarget.src);
			}}
			role="presentation"
		/>
	{/if}
	<Content />
</section>

<section class="mx-4">
	<div class="flex flex-col lg:flex-row gap-4 justify-between items-start">
		<div class="flex-1">
			<h2 class="h3 mb-3">Filter</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each filterableStructure as { key, label }}
					<label class="label">
						<span>{label}</span>
						<select
							class="select bg-surface-200 preset-outlined-surface-400-600"
							bind:value={selectedValues[key]}
						>
							<option value="">All</option>
							{#each filterOptions[key] ?? [] as option}
								<option value={option}>{option}</option>
							{/each}
						</select>
					</label>
				{/each}
			</div>
			<button class="btn preset-tonal-primary mt-4" onclick={resetFilters}> Reset filters </button>
		</div>
		<div class="lg:w-48 flex-none text-right">
			<p class="mt-1">
				Found {filteredItems.length} Result{filteredItems.length !== 1 ? 's' : ''}.
			</p>
		</div>
	</div>

	<CollectionGrid structure={data.structure.filter((s) => s.showInList)} items={filteredItems} />
</section>
