<script>
	import { base } from '$app/paths';
	/**
	 * @type {any[]}
	 */
	export let items = [];

	/**
	 * @type {Array<{label: string, key: string}>}
	 */
	export let structure = [];

	/**
	 * @type IntersectionObserver
	 */
	let intersectionObserver;

	function ensureIntersectionObserver() {
		if (intersectionObserver) return;

		intersectionObserver = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				visibleNumber += 30;
				intersectionObserver.unobserve(entry.target);
			});
		});
	}

	/**
	 *
	 * Function that creates an IntersectionObserver instance and observes the element
	 *
	 * @param element {HTMLElement}
	 * @param abort {boolean}
	 */
	function viewport(element, abort) {
		// we only want the observer on the last Element, so we abort all but the last one i !== visibleItems.length - 1
		if (abort) return;
		ensureIntersectionObserver();

		intersectionObserver.observe(element);

		return {
			destroy() {
				intersectionObserver.unobserve(element);
			}
		};
	}

	const handleSort =
		/**
		 * @param {MouseEvent & {target: HTMLElement}} event
		 * @param {string} key
		 */
		(event, key) => {
			const i = event.target?.querySelector('i');

			const sort = (key, order) => {
				items = items.sort((a, b) => {
					if (order === 'asc') {
						if (a[key] < b[key]) return -1;
						if (a[key] > b[key]) return 1;
						return 0;
					} else {
						if (a[key] > b[key]) return -1;
						if (a[key] < b[key]) return 1;
						return 0;
					}
				});
			};

			if (i) {
				if (i.classList.contains('fa-sort')) {
					i.classList.remove('fa-sort');
					i.classList.add('fa-sort-up');
					sort(key, 'asc');
				} else if (i.classList.contains('fa-sort-up')) {
					i.classList.remove('fa-sort-up');
					i.classList.add('fa-sort-down');
					sort(key, 'desc');
				} else {
					i.classList.remove('fa-sort-down');
					i.classList.add('fa-sort');
					if (items[0].hasOwnProperty('score')) {
						sort('score', 'desc');
					} else {
						sort('catalogNumber', 'desc');
					}
				}
			}
		};
	let visibleNumber = 30;
	$: visibleItems = items.slice(0, visibleNumber);
</script>

<!-- Responsive Container (recommended) -->
<div class="table-container">
	<!-- Native Table Element -->
	<table class="table table-interactive">
		<thead>
			<tr>
				<th class="table-cell-fit">Scientific Name</th>
				{#each structure as { key, label }}
					<th class="hover:cursor-pointer table-cell-fit" on:click={(e) => handleSort(e, key)}
						>{label} <i class="fa-solid pointer-events-none fa-sort"></i></th
					>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each visibleItems as row, i (row.catalogNumber)}
				<tr use:viewport={i !== visibleItems.length - 1}>
					<td class="table-cell-fit">
						<a href={`${base}/item/${row.catalogNumber}`}>
							{row.genus}
							{row.specificEpithet}
						</a>
					</td>
					{#each structure as { key }}
						<td class="table-cell-fit"
							><a href={`${base}/item/${row.catalogNumber}`}>{row[key]}</a></td
						>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
