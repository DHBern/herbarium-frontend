<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
</script>

<section class="container mx-auto px-4 my-16 flex flex-col items-center gap-4 text-center">
	<h1 class="h1">{page.status}</h1>
	<p>
		{page.status === 404
			? (page.error?.message ?? 'Page not found.')
			: 'Something went wrong while loading this page.'}
	</p>
	<a href={resolve('/')} class="btn preset-filled-primary-500">Back to the herbarium</a>
</section>
