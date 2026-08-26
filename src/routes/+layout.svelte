<script lang="ts">
	import './layout.css';
	import { page } from '$app/state';

	import '@fortawesome/fontawesome-free/css/solid.min.css';
	import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
	import { resolve } from '$app/paths';
	import { afterNavigate, goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import boga from '$lib/assets/BOGA-Logo_Black.svg';
	import unibe from '$lib/assets/unibe.svg';
	import LightBox from '$lib/components/LightBox.svelte';

	let { children }: { children?: import('svelte').Snippet } = $props();

	afterNavigate((params) => {
		const isNewPage = params.from?.url?.pathname !== params.to?.url?.pathname;
		const elemPage = document.querySelector('#page');

		if (isNewPage && elemPage !== null) {
			elemPage.scrollTop = 0;
		}
	});

	let mobileMenuOpen = $state(false);

	let classesActive = $derived((href: string) => (href === page.route.id ? 'bg-primary-500' : ''));

	const pages = [
		{ slug: 'home', path: '/' },
		{ slug: 'illustrations', path: '/illustrations' },
		{ slug: 'about us', path: '/about' },
		{ slug: 'impressum', path: '/impressum' }
	];

	let searchtext = $state('');
	let otherSearchisVisible = $state(false);
	let header: HTMLElement | null = null;

	function doSearch() {
		const to = searchtext;
		searchtext = '';
		mobileMenuOpen = false;
		goto(resolve(`/?s=${to}`, {}));
	}

	let observer: IntersectionObserver;

	onMount(() => {
		const inputElements = document.querySelectorAll('main .input');
		const options = { root: null, rootMargin: '0px', threshold: 0.5 };

		observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					otherSearchisVisible = true;
				} else {
					otherSearchisVisible = false;
				}
			});
		}, options);

		inputElements.forEach((element) => {
			observer.observe(element);
		});

		return () => {
			observer?.disconnect();
		};
	});

	afterNavigate(() => {
		otherSearchisVisible = false;

		const inputElements = document.querySelectorAll('main .input');

		if (observer) {
			inputElements.forEach((element) => {
				observer.observe(element);
			});
		} else {
			console.log('observer not defined');
		}
	});
</script>

<svelte:head>
	<script
		defer
		src="https://umami.dsl.unibe.ch/script-umami.js"
		data-website-id="2517db3a-5234-4936-957f-99064a9c0a19"
	></script>
</svelte:head>

<svelte:document
	onkeydown={(event) => {
		if (event.key === 'Escape' && mobileMenuOpen) {
			mobileMenuOpen = false;
		}
	}}
	onclick={(event) => {
		const target = event.target as Node | null;
		if (mobileMenuOpen && header && target && !header.contains(target)) {
			mobileMenuOpen = false;
		}
	}}
/>

<div class="flex h-full flex-col">
	<!-- Header / App Bar -->
	<header class="flex-none bg-surface-100-900 px-4" bind:this={header}>
		<div class="flex h-full items-center justify-between gap-4 flex-wrap">
			<!-- Lead: mobile menu toggle -->
			<button
				class="btn-icon md:hidden"
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
				aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={mobileMenuOpen}
				aria-controls="mobile-nav"
			>
				<i class="fa-solid {mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}"></i>
			</button>

			<!-- Desktop navigation -->
			<nav class="hidden h-full flex-none items-center md:flex gap-1">
				{#each pages as page}
					<a
						href={resolve(page.path, {})}
						class="flex h-full items-center p-4 hover:preset-tonal-primary {classesActive(
							page.path
						)}">{page.slug}</a
					>
				{/each}

				{#if !otherSearchisVisible}
					<label>
						<input
							class="input placeholder-primary-600 bg-surface-200 rounded-full ml-2"
							type="text"
							placeholder="search"
							aria-label="Search"
							bind:value={searchtext}
							onchange={doSearch}
						/>
					</label>

					<a href={resolve(`/?s=${searchtext}`, {})} class="btn-icon" aria-label="Search"
						><i class="fa-solid fa-search"></i></a
					>
				{/if}
			</nav>

			<!-- Trail: logos -->
			<div class="flex items-center gap-2">
				<a href="https://www.unibe.ch" target="_blank" rel="noopener">
					<img
						src={unibe}
						alt="Logo of the University of Bern"
						class="my-1 h-10.75 max-h-20 w-auto"
					/>
				</a>

				<a
					href="https://www.boga.unibe.ch/wissenschaft/herbarium/index_ger.html"
					target="_blank"
					rel="noopener"
				>
					<img
						src={boga}
						alt="Logo of the botanical garden"
						class="my-1 h-10.75 max-h-20 w-auto"
						height="43"
						width="72"
					/>
				</a>
			</div>
			<!-- Mobile navigation drawer -->
			{#if mobileMenuOpen}
				<div class="basis-full h-0"></div>
				<nav id="mobile-nav" class="md:hidden w-full" transition:slide>
					<ul class="pb-2">
						{#each pages as page}
							<li>
								<a
									href={resolve(page.path, {})}
									class="block rounded px-4 py-2 hover:preset-tonal-primary {classesActive(
										page.path
									)}"
									onclick={() => (mobileMenuOpen = false)}
								>
									{page.slug}
								</a>
							</li>
						{/each}
						<li class="px-4 py-2">
							<div class="flex gap-2">
								<input
									class="input placeholder-primary-600 bg-surface-200 rounded-full flex-1"
									type="text"
									placeholder="search"
									aria-label="Search"
									bind:value={searchtext}
									onchange={doSearch}
								/>
								<a
									href={resolve(`/?s=${searchtext}`, {})}
									class="btn-icon"
									aria-label="Search"
									onclick={() => (mobileMenuOpen = false)}
								>
									<i class="fa-solid fa-search"></i>
								</a>
							</div>
						</li>
					</ul>
				</nav>
			{/if}
		</div>
	</header>

	<!-- Page Route Content -->
	<main id="page" class="flex-auto overflow-y-auto">
		{@render children?.()}

		<!-- Page Footer -->
		<footer class="bg-surface-200-800 p-4">
			<div class="grid grid-cols-2 gap-4 lg:mr-10 lg:ml-10">
				<p class="h5 md:h6 lg:h5 col-span-2 justify-self-start">
					A project of the Herbarium of the Botanical Garden of the University of Bern
				</p>
			</div>
		</footer>
	</main>
</div>

<LightBox />
