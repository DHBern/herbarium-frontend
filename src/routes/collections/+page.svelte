<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div class="px-8 pt-16 image-background h-[30vh]"></div>

<section class="w-full px-8 my-8">
	<div class="container py-4 mx-auto">
		<h1 class="h1 font-bold tracking-wide mb-4">Collections</h1>
		<p class="p lg:text-xl mb-8">
			Explore curated selections from the Herbarium Bernense. Each collection has its own filters
			and structure.
		</p>

		<ul class="list-inside list-disc space-y-2">
			{#each data.collections as collection}
				<li>
					<a class="anchor" href={resolve('/collections/[collection]', { collection })}>
						{collection}
					</a>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.image-background {
		background-image: image-set(
			url('$lib/assets/P1044324.00_00_45_03.Still003.webp') type('image/webp'),
			url('$lib/assets/P1044324.00_00_45_03.Still003.jpg') type('image/jpg')
		);
		background-size: cover;
		background-position: center -200px;
		background-attachment: fixed;
		background-repeat: no-repeat;
	}
</style>
