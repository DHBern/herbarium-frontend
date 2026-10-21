<script lang="ts">
	import { resolve } from '$app/paths';
	import type { CollectionContent, ItemStructure } from '../../routes/types';

	interface Props {
		items: CollectionContent[];
		structure: ItemStructure[];
	}

	let { items, structure }: Props = $props();

	const nameKeys = new Set(['Label Name', 'Label_Name', 'Accepted Name', 'Accepted_Name']);
</script>

<div class="table-wrap">
	<table class="table bg-primary-100">
		<thead class="bg-primary-400">
			<tr>
				{#each structure as { key, label } (key)}
					<th class="text-surface-950">{label}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each items as item, i (i)}
				<tr class="border-primary-800/20 even:bg-primary-400/30">
					{#each structure as { key } (key)}
						{@const value = item[key]}
						<td class={nameKeys.has(key) ? 'italic' : ''}>
							{#if item.Catalog_Number && value !== undefined && value !== ''}
								<a
									class="anchor"
									href={resolve('/item/[collection]/[slug]', {
										collection: 'main',
										slug: item.Catalog_Number
									})}
								>
									{value}
								</a>
							{:else}
								{value ?? ''}
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
