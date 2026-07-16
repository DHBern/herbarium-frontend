<script lang="ts">
	import CollectionPage from '$lib/components/CollectionPage.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const Content = $derived(data.Content);
</script>

<CollectionPage {data}>
	<Content />
</CollectionPage>
