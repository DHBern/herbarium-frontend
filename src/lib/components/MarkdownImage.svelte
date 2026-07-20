<script lang="ts">
	import { openLightbox } from '$lib/functions';
	interface Props {
		src: string;
		alt: string;
		title?: string;
	}

	let { src, alt, title }: Props = $props();
</script>

<enhanced:img
	{src}
	{alt}
	{title}
	class="max-w-full md:max-w-96 mx-auto mt-4 md:my-4 md:mr-6 border-8 border-primary-500 anchor cursor-pointer"
	onclick={(e: Event & { currentTarget: HTMLImageElement }) => {
		openLightbox(e.currentTarget.src);
	}}
	role="presentation"
/>
