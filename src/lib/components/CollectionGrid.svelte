<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Item, ItemStructure } from '../../routes/types';

	interface Props {
		items: Item[];
		structure: ItemStructure[];
	}

	let { items, structure }: Props = $props();

	let sortKey = $state<string | null>(null);
	let sortDirection = $state<'asc' | 'desc' | null>(null);
	let visibleNumber = $state(30);

	let intersectionObserver: IntersectionObserver | undefined;

	const catalogNumberKey = $derived(
		structure.find((s) => /catalog\s*number/i.test(s.key))?.key ?? null
	);

	function hasUsableCatalogNumber(item: Item): boolean {
		if (!catalogNumberKey) return false;
		const value = item[catalogNumberKey];
		return typeof value === 'string' && value.trim() !== '' && value.trim().toLowerCase() !== 'na';
	}

	const sortedItems = $derived.by(() => {
		const list = [...items];
		if (sortKey && sortDirection) {
			list.sort((a, b) => {
				const aVal = a[sortKey!] ?? '';
				const bVal = b[sortKey!] ?? '';
				if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
				if (aVal > bVal) return sortDirection === 'desc' ? 1 : -1;
				return 0;
			});
		}
		return list;
	});

	const visibleItems = $derived(sortedItems.slice(0, visibleNumber));

	function ensureIntersectionObserver() {
		if (intersectionObserver) return;
		intersectionObserver = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting && visibleNumber < items.length) {
					visibleNumber += 30;
					intersectionObserver?.unobserve(entry.target);
				}
			});
		});
	}

	function viewport(element: HTMLElement, isLast: boolean) {
		if (!isLast) return;
		ensureIntersectionObserver();
		intersectionObserver?.observe(element);
		return {
			destroy() {
				intersectionObserver?.unobserve(element);
			}
		};
	}

	function handleSort(key: string) {
		if (sortKey !== key) {
			sortKey = key;
			sortDirection = 'asc';
		} else if (sortDirection === 'asc') {
			sortDirection = 'desc';
		} else {
			sortKey = null;
			sortDirection = null;
		}
		visibleNumber = 30;
	}

	function sortIcon(key: string): string {
		if (sortKey !== key) return 'fa-sort';
		return sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
	}

	function cellContent(item: Item, key: string): string {
		const value = item[key];
		if (value === undefined || value === null) return '';
		return String(value);
	}
</script>

<div class="table-wrap">
	<table class="table bg-primary-100!">
		<thead class="border-primary-800/20! bg-primary-400!">
			<tr>
				{#each structure as { key, label }}
					<th class="hover:cursor-pointer w-0 whitespace-nowrap" onclick={() => handleSort(key)}>
						{label} <i class="fa-solid pointer-events-none {sortIcon(key)}"></i>
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each visibleItems as row, i (i)}
				<tr
					class="border-primary-800/20! even:bg-primary-400/30!"
					use:viewport={i === visibleItems.length - 1}
				>
					{#each structure as { key }, j}
						{@const content = cellContent(row, key)}
						<td class="w-0 whitespace-nowrap {j === 0 ? 'italic' : ''}">
							{#if j === 0}<i class="fa-solid fa-camera"></i>{/if}
							{#if hasUsableCatalogNumber(row)}
								<a href={resolve('/item/[slug]', { slug: String(row[catalogNumberKey!]) })}>
									{content}
								</a>
							{:else}
								{content}
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
