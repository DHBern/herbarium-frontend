<script>

	
	/** @type {{class?: string, dark?: boolean, children?: import('svelte').Snippet}} */
	let { class: className = '', dark = false, children } = $props();
</script>

<section class="w-full px-8 my-8 {dark ? 'bg-tertiary-500 text-black' : ''}">
	<div class="container py-4 mx-auto {className}">
		{@render children?.()}
	</div>

</section>
