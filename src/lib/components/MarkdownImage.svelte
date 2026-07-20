<script lang="ts">
	interface Props {
		src: string;
		alt: string;
		title?: string;
	}

	let { src, alt, title }: Props = $props();
</script>

<enhanced:img {src} {alt} {title} class="max-w-2xl" />
