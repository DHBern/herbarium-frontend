<script>
	import ContentContainer from '$lib/components/ContentContainer.svelte';
	import stiftung from '$lib/assets/stiftung_boga.svg';
	import bgb from '$lib/assets/BGB_Logo_Office_M.svg';
	import aplus from '$lib/assets/a+_logo_SCNAT_DE_RGB.png';
	import gvb from '$lib/assets/gvb.svg';
	import uws from '$lib/assets/uws.svg';
	import swisslos from '$lib/assets/swisslos.svg';
	import fjd from '$lib/assets/fjd.svg';
	import { openLightbox } from '$lib/functions';

	const logos = [
		{ src: stiftung, alt: 'Stiftung Boga' },
		{ src: bgb, alt: 'Burgergemeinde Bern' },
		{ src: aplus, alt: 'Swiss Academy of Sciences' },
		{ src: gvb, alt: 'Gebäudeversicherung Bern' },
		{ src: uws, alt: 'Ursula Wirz-Stiftung' },
		{ src: swisslos, alt: 'Swisslos' },
		{ src: fjd, alt: 'fondation johanna dürmüller-bol' }
	];
</script>

<ContentContainer>
	<h1 class="h1">About the project</h1>
	<p>
		The Herbarium of the Botanical Garden of the University of Bern (Herbarium Bernense) is one of
		the five largest herbaria in Switzerland. This collection includes plants, algae and fungi
		either dried or preserved in alcohol. The specimens can last for centuries and represent a
		unique long-term archive of the occurrence, distribution, and diversity of the respective
		organisms.
	</p>
	<h2 class="h2">Collections of the Herbarium Bernense</h2>
	<enhanced:img
		src="$lib/assets/3E2A0219.jpg"
		alt="herbarium"
		class="max-w-full md:max-w-96 md:float-left mx-auto mt-4 md:my-4 md:mr-6 border-8 border-primary-500 anchor cursor-pointer"
		onclick={(e) => {
			openLightbox(e.target);
		}}
		onkeypress={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				openLightbox(e.target);
			}
		}}
		role="presentation"
	/>
	<ul class="list-disc list-inside *:-indent-4 *:ml-4">
		<li>
			<strong>Herbarium specimens:</strong> The largest collection of the Herbarium Bernense are the
			herbarium specimens, pressed and mounted on herbarium sheets. The oldest of the estimated 500,000
			specimens dates back to the year 1753.
		</li>
		<li>
			<strong>Wet collection:</strong> The wet collection, preserved in an 75% ethanol solution, is probably
			the largest historical wet collection of plants and fungi in Switzerland and comprises 1,142 specimens.
		</li>
		<li>
			<strong>Dry bulk collection:</strong> This collection comprises about 3000 specimens of seeds,
			woody fruits, tree cross sections and fungi fruit bodies.
		</li>
		<li>
			<strong>Fossil collection:</strong> About 3000 specimens of fossilized plants and archaeological
			finds (e.g. fossilised grains from prehistoric pile dwellings) are contained in this collection.
		</li>
		<li>
			<strong>Botanical illustrations:</strong> Botanical illustrations have the advantage that they
			can show natural colours better than preserved specimens, such as the magnificent water
			colours of fungi by
			<a class="anchor" href="http://www.botany.unibe.ch/gallery/otth.php" target="_blank"
				>Gustav Otth</a
			> (1806-1874).
		</li>
		<li>
			<strong>Photo collection:</strong> Besides slides and photographs, the Herbarium Bernense includes
			several artistically hand-coloured glass plates, including those by Josef Hanel (1865-1940). He
			enjoyed a high reputation as a master of the photographic craft and as a gifted artist.
		</li>
	</ul>

	<h2 class="h2">Reconditioning and digitization</h2>
	<enhanced:img
		src="$lib/assets/3E2A0231.jpg"
		alt="herbarium"
		class="max-w-full md:max-w-96 md:float-right mx-auto mt-4 md:my-4 md:ml-6 border-8 border-primary-500 anchor cursor-pointer"
		onclick={(e) => {
			openLightbox(e.target);
		}}
		onkeypress={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				openLightbox(e.target);
			}
		}}
		role="presentation"
	/>
	<p>
		Since 2022, four projects are currently running to recondition and digitize the first 10% of the
		Herbarium Bernense collection. These projects were made possible by the Swiss Network of Natural
		History Collections (<a class="anchor" href="https://swisscollnet.scnat.ch/de" target="_blank"
			>SwissCollNet</a
		>):
	</p>
	<ul class="list-disc list-inside *:-indent-4 *:ml-4">
		<li>
			"Efficient digitisation of herbarium specimens through the use of digitisation routes". In
			collaboration with the <a class="anchor" href="http://www.naturama.ch/museum" target="_blank"
				>Naturama Aargau</a
			>
		</li>
		<li>
			"Historical Swiss alcohol collections of plants and fungi: rare and hidden treasures". In
			collaboration with the <a
				class="anchor"
				href="https://www.botmuseum.uzh.ch/de.html"
				target="_blank">Botanical Museum of the University of Zurich</a
			>
		</li>
		<li>
			"Digitisation of the Fribourg (NHMF) and Bern (BERN) herbaria". In collaboration with the
			<a class="anchor" href="https://www.fr.ch/de/nhmf" target="_blank"
				>Natural History Museum of Fribourg</a
			>
			and the Botanical Garden of the University of Fribourg,
			<a class="anchor" href="https://www.unifr.ch/jardin-botanique/de/" target="_blank"
				>Botanical Garden of the University of Fribourg</a
			>
		</li>
		<li>
			"Digitisation of the three-dimensional dry collection and associated herbarium specimens" In
			collaboration with the <a
				class="anchor"
				href="https://www.botmuseum.uzh.ch/de.html"
				target="_blank">Botanical Museum of the University of Zurich</a
			>, the
			<a class="anchor" href="https://www.herbarien.uzh.ch/de.html" target="_blank"
				>Herbaria of the University and ETH Zurich</a
			>
			and the
			<a class="anchor" href="https://stadt.winterthur.ch/naturmuseum" target="_blank"
				>Naturmuseum Winterthur</a
			>
		</li>
	</ul>
	<h2 class="h2">Funding</h2>
	<p>
		Reconditioning and digitization of the Herbarium Bernense are kindly funded by the following
		institutions:
	</p>
	<div
		class="logo-cloud grid-cols-1 md:!grid-cols-3 sm:!grid-cols-2 gap-1 items-middle justify-items-center"
	>
		{#each logos as { src, alt }}
			<img {src} {alt} width="180px" />
		{/each}
	</div>

	<h2 class="h2">Technical implementation</h2>
	<p>
		This website is a purely static build with a client-side search component. It is hosted by
		Github and was developed by Sebastian Flick and Peter Dängeli of the <a
			href="https://www.dsl.unibe.ch/"
			class="anchor">Data Science Lab</a
		>
		using Svelte and Svelte-Kit. For more technical information, see our
		<a href="https://github.com/DHBern/herbarium-frontend" target="_blank" class="anchor"
			>Github repository</a
		>.
	</p>
	<p>
		<enhanced:img
			src="$lib/assets/International_Image_Interoperability_Framework_logo.png"
			width="180px"
			class="float-right"
		/>
		The images for the website are made available via the International Image Interoperability Framework
		(IIIF), see <a class="anchor" href="https://iiif.io/" target="_blank">https://iiif.io/</a>. We
		use the IIIF service of the University Library Bern for this purpose, see
		<a class="anchor" href="hhttps://bib.unibe.ch/iiif" target="_blank">https://bib.unibe.ch/iiif</a
		>
	</p>
	<p>Cover picture by Andrea Bordoli</p>
</ContentContainer>
