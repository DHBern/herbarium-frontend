<script>
	import { page } from '$app/stores';
	import '../app.postcss';
	import 'bigger-picture/css';
	import {
		AppShell,
		AppBar,
		getDrawerStore,
		Drawer,
		initializeStores,
		Toast
	} from '@skeletonlabs/skeleton';
	import '@fortawesome/fontawesome-free/css/solid.min.css';
	import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
	import { base } from '$app/paths';
	import { afterNavigate, goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import boga from '$lib/assets/BOGA-Logo_Black.svg';
	import unibe from '$lib/assets/unibe.svg';
	import { biggerPicture } from '$lib/stores';
	import BiggerPicture from 'bigger-picture/svelte';

	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	afterNavigate((/** @type import('@sveltejs/kit').AfterNavigate */ params) => {
		const isNewPage = params.from?.url?.pathname !== params.to?.url?.pathname;
		const elemPage = document.querySelector('#page');
		if (isNewPage && elemPage !== null) {
			elemPage.scrollTop = 0;
		}
	});

	initializeStores();
	const drawerStore = getDrawerStore();

	$: classesActive = (/** @type {string} */ href) =>
		base + href === $page?.url?.pathname ? 'bg-primary-500' : '';

	function drawerOpen() {
		const /** @type {import('@skeletonlabs/skeleton').DrawerSettings} */ s = {
				id: 'topnav',
				position: 'top'
			};
		drawerStore.open(s);
	}

	const pages = [
		{ slug: 'home', path: '/' },
		{ slug: 'illustrations', path: '/illustrations' },
		{ slug: 'about us', path: '/about' },
		{ slug: 'impressum', path: '/impressum' }
	];
	let searchtext = '';
	let otherSearchisVisible = false;
	/**
	 * @type {IntersectionObserver}
	 */
	let observer;

	onMount(() => {
		const inputElements = document.querySelectorAll('main .input');

		const options = {
			root: null,
			rootMargin: '0px',
			threshold: 0.5
		};

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

		// initialize lightbox
		$biggerPicture = BiggerPicture({
			target: document.body
		});
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

<Drawer height="h-auto">
	<nav class="list-nav">
		<ul>
			{#each pages as page}
				<li>
					<a href={`${base}${page.path}`}>
						<span class="flex-auto">{page.slug}</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</Drawer>
<Toast
	buttonAction="btn btn-icon-sm variant-ghost"
	buttonDismiss="btn-icon btn-icon-md variant-ghost"
/>
<!-- App Shell -->
<AppShell slotPageFooter="bg-surface-200-700-token p-4">
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar padding="px-4" background="bg-surface-100-900-token">
			<nav class="flex-none items-center h-full hidden md:flex">
				{#each pages as page}
					<a
						href={`${base}${page.path}`}
						class="list-nav-item h-full p-4 bg-primary-hover-token {classesActive(page.path)}"
						>{page.slug}</a
					>
				{/each}
				{#if !otherSearchisVisible}
					<label>
						<input
							class="input placeholder-primary-600 ml-2"
							type="text"
							placeholder="searchinput..."
							bind:value={searchtext}
							on:change={() => {
								const to = searchtext;
								searchtext = '';
								goto(`${base}/?s=${to}`);
							}}
						/>
					</label>
					<a href={`${base}?s=${searchtext}`} class="btn-icon">
						<i class="fa-solid fa-search"></i>
					</a>
				{/if}
			</nav>
			<svelte:fragment slot="lead">
				<button class="md:!hidden btn-icon" on:click={drawerOpen}>
					<i class="fa-solid fa-bars"></i>
				</button>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<a href="https://www.unibe.ch" target="_blank" rel="noopener">
					<img
						src={unibe}
						alt="Logo of the University of Bern"
						class="max-h-[80px] h-[43px] w-auto my-1"
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
						class="max-h-[80px] h-[43px] w-auto my-1"
						height="43"
						width="72"
					/>
				</a>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
	<svelte:fragment slot="pageFooter">
		<div class="grid grid-cols-2 lg:ml-10 lg:mr-10 gap-4">
			<p class="h5 md:h6 lg:h5 col-span-2 justify-self-start">
				A project of the Herbarium of the Botanical Garden of the University of Bern
			</p>
		</div>
	</svelte:fragment>
</AppShell>
