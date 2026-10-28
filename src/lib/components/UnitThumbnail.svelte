<script lang="ts">
	import { thumbnailUrl } from '#lib/functions.js';

	interface Props {
		id: string;
		/** Image API id, if it differs from `id` (e.g. display herbarium panels) */
		imageId?: string;
		title: string;
		href: string;
		sizes: string;
		onclick?: () => void;
	}

	let { id, imageId = id, title, href, sizes, onclick }: Props = $props();

	let failedId = $state<string | null>(null);
	let failed = $derived(failedId === id);
</script>

<a
	{href}
	{onclick}
	class="group flex flex-col gap-2 rounded-container p-2 hover:preset-tonal-primary focus-visible:preset-tonal-primary"
>
	<div
		class="aspect-3/4 w-full overflow-hidden bg-primary-100 flex items-center justify-center rounded-base"
	>
		{#if failed}
			<i class="fa-solid fa-image fa-2xl text-primary-400" aria-hidden="true"></i>
		{:else}
			<img
				src={thumbnailUrl(imageId, 'small')}
				srcset={`${thumbnailUrl(imageId, 'small')} 300w, ${thumbnailUrl(imageId, 'medium')} 550w`}
				{sizes}
				alt={title}
				loading="lazy"
				decoding="async"
				class="h-full w-full object-contain transition-transform group-hover:scale-105"
				onerror={() => (failedId = id)}
			/>
		{/if}
	</div>
	<span class="text-center font-medium">{title}</span>
</a>
