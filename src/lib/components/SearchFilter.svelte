<script lang="ts">
	import { ToggleGroup, Combobox, Portal, useListCollection } from '@skeletonlabs/skeleton-svelte';
	import { slide } from 'svelte/transition';
	import type { ItemStructure } from '../../routes/types.js';

	interface Props {
		item: ItemStructure;
		values: string[];
		selected: string[];
		class?: string;
	}

	let { item, values, selected = $bindable([]), class: className = '' }: Props = $props();

	// svelte-ignore state_referenced_locally
	let filteredValues = $state(values);
	const collection = $derived(
		useListCollection({
			items: filteredValues,
			itemToString: (value) => value,
			itemToValue: (value) => value
		})
	);
</script>

<div class="label {className}" transition:slide|global>
	<span>{item.label}</span>
	{#if values.length <= 4}
		<div class="block">
			<ToggleGroup
				class="w-full flex-col sm:w-auto sm:flex-row"
				value={selected}
				onValueChange={(v) => (selected = v.value)}
				multiple
			>
				{#each values as value (value)}
					<ToggleGroup.Item class="whitespace-nowrap" {value}>
						{value}
					</ToggleGroup.Item>
				{/each}
			</ToggleGroup>
		</div>
	{:else}
		<Combobox
			value={selected}
			{collection}
			onValueChange={(v) => (selected = v.value)}
			onInputValueChange={(e) => {
				const filtered = values.filter((i) => i.toLowerCase().includes(e.inputValue.toLowerCase()));
				filteredValues = filtered.length > 0 ? filtered : values;
			}}
			onOpenChange={() => {
				filteredValues = values;
			}}
			openOnClick
			placeholder={`Filter by ${item.label ?? item.key}`}
			multiple
		>
			<Combobox.Control>
				<Combobox.Input />
				<Combobox.Trigger />
			</Combobox.Control>
			<Portal>
				<Combobox.Positioner>
					<Combobox.Content>
						{#each filteredValues as comboItem (comboItem)}
							<Combobox.Item item={comboItem}>
								<Combobox.ItemText>{comboItem}</Combobox.ItemText>
								<Combobox.ItemIndicator />
							</Combobox.Item>
						{/each}
					</Combobox.Content>
				</Combobox.Positioner>
			</Portal>
		</Combobox>
		<div class="flex flex-wrap gap-2 mt-1">
			{#each selected as value (value)}
				<span class="badge preset-filled">
					{value}
				</span>
			{/each}
		</div>
	{/if}
</div>
