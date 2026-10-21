<script lang="ts">
	import { resolve } from '$app/paths';
	import Intro from '#lib/collections/content.md';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div class="px-8 pt-16 image-background h-[30vh]"></div>

<section class="w-full px-8 my-8">
	<div class="container py-4 mx-auto">
		<div class="mb-8 lg:text-xl">
			<Intro />
		</div>

		<ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
			{#each data.collections as collection (collection.slug)}
				<li>
					<a
						class="card preset-tonal-primary hover:preset-filled-primary-500 flex h-full flex-col overflow-hidden"
						href={resolve('/collections/[collection]', { collection: collection.slug })}
					>
						{#if collection.featured}
							<enhanced:img
								src={collection.featured}
								alt=""
								class="aspect-4/3 w-full object-cover"
							/>
						{:else}
							<div class="aspect-4/3 w-full bg-primary-200 flex items-center justify-center">
								<i class="fa-solid fa-leaf fa-2xl text-primary-500" aria-hidden="true"></i>
							</div>
						{/if}
						<span class="h4 p-4">{collection.title}</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.image-background {
		background-image: image-set(
			url('../../lib/assets/P1044324.00_00_45_03.Still003.webp') type('image/webp'),
			url('../../lib/assets/P1044324.00_00_45_03.Still003.jpg') type('image/jpg')
		);
		background-size: cover;
		background-position: center -200px;
		background-attachment: fixed;
		background-repeat: no-repeat;
	}
</style>
