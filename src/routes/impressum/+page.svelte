<script lang="ts">
	import ContentContainer from '$lib/components/ContentContainer.svelte';
	import {openLightbox2,closeLightbox} from '$lib/functions';
 </script>

<ContentContainer>
	<h1 class="h1">Impressum</h1>
	<div class="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
		<div>
			<h2 class="h2">Location</h2>
			<p>
				Herbarium des Botanischen Gartens Bern<br />
				Länggassstrasse 31-37<br />
				3012 Bern<br />
				Switzerland
			</p>
		</div>
		<enhanced:img
			src="$lib/assets/IMG_8229.jpg"
			alt="herbarium"
			class="max-w-full border-8 border-primary-500 anchor cursor-pointer"
			onclick={(e: any) => {
				openLightbox2(e.target.src);
			}}
			onkeypress={(e: any) => {
				if (e.key === 'Enter' || e.key === ' ') {
					closeLightbox();
				}
			}}
			role="presentation"
		/>
		<div>
			<h2 class="h2">Postal Address</h2>
			<p>
				Unitobler<br />
				Herbarium des Botanischen Gartens Bern<br />
				Länggassstrasse 49<br />
				3012 Bern
			</p>
		</div>
		<enhanced:img
			src="$lib/assets/P1770528.jpg"
			alt="herbarium"
			class="max-w-full border-8 border-primary-500 anchor cursor-pointer"
			onclick={(e: any) => {
				openLightbox2(e.target.src);
			}}
			onkeypress={(e: any) => {
				if (e.key === 'Enter' || e.key === ' ') {
				    closeLightbox();
				}
			}}
			role="presentation"
		/>
		<div>
			<h2 class="h2">Contact</h2>
			<p>
				Dr. Katja Rembold (curator)<br />
				<a class="anchor" href="mailto:katja.rembold@unibe.ch" target="_blank"
					>katja.rembold@unibe.ch</a
				>
			</p>
			<p>
				Rahel Vetsch (project coordinator)<br />
				<a class="anchor" href="mailto:rahel.vetsch@unibe.ch" target="_blank"
					>rahel.vetsch@unibe.ch</a
				>
			</p>
			<p>
				Phone: <a class="anchor" href="tel:+41316844973">+41 31 684 49 73</a>
			</p>
		</div>
		<enhanced:img
			src="$lib/assets/P1006420.jpg"
			alt="herbarium"
			class="max-w-full border-8 border-primary-500 anchor cursor-pointer"
			onclick={(e : any) => {
				openLightbox2(e.target.src);
			}}
			onkeypress={(e: any) => {
				if (e.key === 'Enter' || e.key === ' ') {
					closeLightbox();
				}
			}}
			role="presentation"
		/>
		<div>
			<h2 class="h2">Index Herbariorum</h2>
			<p>
				Herbarium Code: <a
					class="anchor"
					href="https://sweetgum.nybg.org/science/ih/herbarium-details/?irn=126603"
					target="_blank">BERN</a
				>
			</p>
		</div>
	</div>
</ContentContainer>
