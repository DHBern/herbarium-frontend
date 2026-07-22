<script context="module">
	import MarkdownImage from '$lib/components/MarkdownImage.svelte';

	export { MarkdownImage as img };
</script>

<div class="prose lg:prose-lg max-w-none">
	<slot />
</div>
