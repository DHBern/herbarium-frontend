<script>
	import ContentContainer from '$lib/components/ContentContainer.svelte';
	import ItemList from '$lib/components/ItemList.svelte';
	import { SlideToggle, RadioGroup, RadioItem, popup } from '@skeletonlabs/skeleton';
	import MiniSearch from 'minisearch';
	import { slide } from 'svelte/transition';

	export let data;

	const CUSTOM_SPACE_OR_PUNCT =
		/[\n\r -#%-*,./:;?@[-\]_{}\u00A0\u00A1\u00A7\u00AB\u00B6\u00B7\u00BB\u00BF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u1680\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2000-\u200A\u2010-\u2029\u202F-\u2043\u2045-\u2051\u2053-\u205F\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u3000-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]+/u;

	let miniSearch = new MiniSearch({
		fields: data.categories, // fields to index for full-text search
		storeFields: data.categories, // fields to return with search results
		idField: data.categories[0], // document property to use as id field
		tokenize: (text) => text.split(CUSTOM_SPACE_OR_PUNCT),
		searchOptions: {
			weights: { fuzzy: 0.3, prefix: 0.2 }
		}
	});
	miniSearch.addAll(data.items);
	const searchConfig = {
		prefix: (/** @type {string} */ term) => term.length <= 6,
		fuzzy: (
			/** @type {string} */ term,
			/** @type {Number} */ _i,
			/** @type {string[]}*/ _terms
		) => {
			if (/\d{4}/.test(term)) {
				return false;
			}
			return 0.2;
		}
	};

	/**
	 * @type {string|import('minisearch').Query}
	 */
	let searchtext = '';
	let advancedToggle = false;
	/** @type {{ [key: string]: string }} */
	let advancedFields = {};

	const asyncSearch = (
		/** @type {import("minisearch").Query} */ query,
		/** @type {import("minisearch").SearchOptions | undefined} */ config
	) => {
		return new Promise((resolve) => {
			const searchresults = miniSearch.search(query, config);
			console.log(searchresults);
			resolve(searchresults);
		});
	};

	let filtereditems = data.items;
	$: {
		if (searchtext) {
			// filter all items for search results
			asyncSearch(searchtext, searchConfig).then((results) => {
				filtereditems = results;
			});
		} else {
			filtereditems = data.items;
		}
	}

	$: {
		if (advancedToggle) {
			if (Object.values(advancedFields).some((i) => !!i)) {
				searchtext = {
					combineWith: 'AND',
					queries: [
						...Object.keys(advancedFields).reduce(
							(/** @type {import('minisearch').Query[]} */ acc, key) => {
								if (advancedFields[key]) {
									acc.push({
										fields: [key],
										queries: [advancedFields[key]]
									});
								}
								return acc;
							},
							[]
						)
					]
				};
			} else {
				searchtext = '';
			}
		}
	}
</script>

<ContentContainer
	class="h-[376px] sm:h-[223px] lg:h-[345px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[1fr_max-content]"
	dark
>
	<div class="z-10 col-span-full md:col-span-1 row-start-1">
		<h1 class="h1 my-16">digital Herbarium</h1>
		<p class="p lg:text-xl">
			search our collection of dried plants from the botanical garden of the University of Bern
		</p>
	</div>
</ContentContainer>
<ContentContainer dark>
	<h2 class="h2 mb-4">Collection</h2>

	<div class="flex flex-col md:flex-row justify-between">
		<div class="md:w-1/2">
			<div class="flex justify-between">
				<h3 class="h3 mb-3">Search and Filter</h3>
				<SlideToggle
					name="advanced-mode"
					active="bg-tertiary-600"
					bind:checked={advancedToggle}
					class="mb-3"
					on:change={() => {
						searchtext = '';
					}}
				>
					{advancedToggle ? 'Simple' : 'Advanced'}
				</SlideToggle>
			</div>
			{#if !advancedToggle}
				<label transition:slide>
					<input
						class="input text-primary-500 p-6 placeholder-primary-500"
						type="text"
						placeholder="Searchinput..."
						bind:value={searchtext}
					/>
				</label>
			{:else}
				{#each data.itemstructure as item, i}
					<label class="label" transition:slide|global>
						<span>
							{item.label}
						</span>
						<input
							class="input text-primary-500 p-6 placeholder-primary-500"
							type="text"
							bind:value={advancedFields[item.key]}
						/>
					</label>
				{/each}
			{/if}

			<p class="mt-5">
				Found {filtereditems.length} Result{filtereditems.length >= 1 ? 's' : ''}.
			</p>
		</div>
	</div>
</ContentContainer>
<ContentContainer>
	<ItemList structure={data.itemstructure} items={filtereditems} />
</ContentContainer>
