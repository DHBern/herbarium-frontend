<script>
	import ContentContainer from '$lib/components/ContentContainer.svelte';
	import { openLightbox } from '$lib/functions';
	import pdf1 from '$lib/assets/1a_Studer_IconesFungorum_001-171.pdf';
	import pdf2 from '$lib/assets/02_Otth_IconesFungorum_Agaricineen.pdf';
	import pdf3 from '$lib/assets/03_Otth_IconesFungorum_Agaricineen.pdf';
	import pdf4 from '$lib/assets/04_Otth_IconesFungorum_Agaricineen.pdf';
	import pdf5 from '$lib/assets/05_Otth_IconesFungorum_Agaricineen.pdf';
	import pdf6 from '$lib/assets/06_Otth_IconesFungorum_Polyporeen.pdf';
	import pdf7 from '$lib/assets/07_Otth_IconesFungorum_Polyporeen.pdf';
	import pdf8 from '$lib/assets/08_Otth_IconesFungorum_Hydneen+Telephoreen+Clavariaceen+Tremellineen.pdf';
	import pdf9 from '$lib/assets/09_Otth_IconesFungorum_Gastromyceten+Uredineen.pdf';
	import pdf10 from '$lib/assets/10_Otth_IconesFungorum_Discomyceten.pdf';
	import pdf11 from '$lib/assets/11_Otth_IconesFungorum_Tubericineen+Pyrenomyceten.pdf';
	import pdf12 from '$lib/assets/12_Otth_IconesFungorum_Imperfecti.pdf';
	import pdf13 from '$lib/assets/13_Otth_IconesFungorum_Ustilagineen+Phykomyceten+Myxomyceten.pdf';
	import pdf14 from '$lib/assets/01_Otth_IconesFungorum_Agaricineen.pdf';	
	import pdf1 from '$lib/assets/2a_Studer_IconesFungorum_172-329.pdf';
	import pdf1 from '$lib/assets/2b_Studer_IconesFungorum_330-447.pdf';
	import pdf1 from '$lib/assets/3a_Studer_IconesFungorum_448-605.pdf';
	import pdf1 from '$lib/assets/3b_Studer_IconesFungorum_606-748.pdf';
	import pdf1 from '$lib/assets/3c_Studer_IconesFungorum_749-839.pdf';
	import pdf1 from '$lib/assets/4a_Studer_IconesFungorum_840-983.pdf';
	import pdf1 from '$lib/assets/4b_Studer_IconesFungorum_984-1090.pdf';
	import pdf1 from '$lib/assets/4c_Studer_IconesFungorum_1091-1178.pdf';
	import pdf1 from '$lib/assets/5_Studer_IconesFungorum.pdf';
</script>

<ContentContainer class="styled">
	<p>
		The Herbarium Bernense also comprises a collection of beautiful scientific illustrations of
		plants, fungi and algae. Compared to herbarium specimens, botanical illustrations have the
		advantage that natural colours can be captured, a perfect specimen with all the important
		characteristics can be shown and small structures can be enlarged. At the same time, they have
		the disadvantage that they usually do not provide information about where and when a species has
		been observed and they do not provide genetic information or microscopic structures that have
		not been drawn in the first place.
	</p>

	<h1 class="h1">Gustav Otth</h1>
	Gustav Heinrich Otth (02.06.1806 – 08.11.1874) was a Swiss mycologist and military officer. He described
	several new fungi species and the genus Pucciniastrum within the family Pucciniastraceae. Detailed
	information about the life and works of Gustav Otth can be found in Eduard Fischer: <a
		href="https://boris.unibe.ch/159775/1/1909_E.Fischer.pdf"
		target="_blank"
	>
		Gustav Otth, ein bernischer Pilzforscher: 1806-1871, in Mitteilungen der Naturforschenden
		Gesellschaft in Bern, 1908, pp. 1665-1700
	</a>.
	<p>
		Gustav Otth compiled 13 volumes of beautiful original watercolours of mushrooms that are now
		part of the Herbarium Bernense collection. PDF-versions of these works can be accessed via the
		links below. His herbarium collection is located at the Fungarium of the United Herbaria Zurich
		Z+ZT.
	</p>
	<enhanced:img
		src="$lib/assets/FB_posts_pilzbuch_03.jpg"
		alt="agaricus adiposus"
		class="max-w-full md:max-w-96 md:float-left mx-auto mt-4 md:my-4 md:mr-6 border-8 border-primary-500 anchor cursor-pointer"
		on:click={(e) => {
			openLightbox(e.target);
		}}
		on:keypress={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				openLightbox(e.target);
			}
		}}
		role="presentation"
	/>
	<ul class="list-disc list-inside *:-indent-4 *:ml-4">
		<li>
			<a class="anchor" href={pdf14} target="_blank">Otth - Icones Fungorum I (Nr. 1 - 111)</a> - Hymenoceten,
			Agaricineen, Agaricus, Leucosporus 1 - ordered according to Fries: Hymenomycetes europaei, 1874
		</li>
		<li>
			<a class="anchor" href={pdf2} target="_blank">Otth - Icones Fungorum II (Nr. 112 - 218)</a> - Hymenoceten,
			Agaricineen, Agaricus, Leucosporus 2 - ordered according to Fries, 1874
		</li>
		<li>
			<a class="anchor" href={pdf3} target="_blank">Otth - Icones Fungorum III (Nr. 219 - 359)</a> -
			Hymenocetes, Agaricineen, Agaricus exclusive Leucosporus - ordered according to Fries, 1874
		</li>
		<li>
			<a class="anchor" href={pdf4} target="_blank">Otth - Icones Fungorum IV (Nr. 360 - 472)</a> - Hymenocetes,
			Agaricineen, Coprinus until Hygrophorus - ordered according to Fries, 1874
		</li>
		<li>
			<a class="anchor" href={pdf5} target="_blank">Otth - Icones Fungorum V (Nr. 473 - 561b)</a> - Hymenocetes,
			Agaricineen, Lactarius until Lenzites - ordered according to Fries, 1874
		</li>
		<li>
			<a class="anchor" href={pdf6} target="_blank">Otth - Icones Fungorum VI (Nr. 562 - 651)</a> - Hymenocetes,
			Polyporeen, Boletus until Polyporus 1 - ordered according to Fries, 1874
		</li>
		<li>
			<a class="anchor" href={pdf7} target="_blank">Otth - Icones Fungorum VII (Nr. 652 - 754)</a> -
			Hymenocetes, Polyporeen, Polyporus 2 until Solenia - ordered according to Fries, 1874
		</li>
		<li>
			<a class="anchor" href={pdf8} target="_blank">Otth - Icones Fungorum VIII (Nr. 755 - 891)</a> -
			Hymenocetes, Hydneen, Telephoreen, Clavariaceen and Tremellineen - ordered according to Fries,
			1874
		</li>
		<li>
			<a class="anchor" href={pdf9} target="_blank">Otth - Icones Fungorum IX (Nr. 891 - 1026)</a> -
			Gastromyceten and Uredineen - ordered according to Winter: Die Pilze in Rabenhorst Krypt. Flora,
			Ed. II
		</li>
		<li>
			<a class="anchor" href={pdf10} target="_blank">Otth - Icones Fungorum X (Nr. 1027 - 1188)</a> -
			Discomyceten - ordered according to Rehm: Die Pilze in Rabenhorst Krypt. Flora, Ed. II
		</li>
		<li>
			<a class="anchor" href={pdf11} target="_blank">Otth - Icones Fungorum XI (Nr. 1189 - 1378)</a>
			- Tuberineen and Pyrenomyceten - ordered according to Ed. Fischer und Winter in Rabenhorst Krypt.
			Flora, Ed. II
		</li>
		<li>
			<a class="anchor" href={pdf12} target="_blank">Otth - Icones Fungorum XII (Nr. 1379 - 1552)</a
			> - Imperfecti (Conidia of unknown affiliation) - in alphabetical order
		</li>
		<li>
			<a class="anchor" href={pdf13} target="_blank"
				>Otth - Icones Fungorum XIII (Nr. 1553 - 1644)</a
			> - Ustilagineen, Phykomyceten, Myxomyceten - ordered according to Winter and Ed. Fischer in Rabenhorst
			Krypt. Flora, Ed. II and Schröter in Krypt. Flora v. Schlesien
		</li>
	</ul>

	<h1 class="h1">Bernhard Studer-Steinhäuslin</h1>
	Bernhard Emil Studer-Steinhäuslin (23. May 1847 - 28. March 1910) was born in Bern as the son of a
	pharmacist. In 1860, he suffered a serious accident and was left with a lifelong paralysis of his left
	hand. In 1865, he entered the pharmaceutical profession and studied at the University of Bern and at
	the Remigius Fresenius Institute in Wiesbaden (Germany). After educational trips to Paris, England
	and Scotland, he took over his father's pharmacy in the Spitalgasse in Bern, which he ran for 33 years
	together with his brother Wilhelm. He was a long-standing board member of the City Pharmacists‘ Association,
	the Cantonal Pharmacists’ Association, the Swiss Pharmacists‘ Association, the Pharmacopoeia Commission
	of the Swiss Pharmacists’ Association and treasurer of the Natural Science Society in Bern. In addition
	to his job and all the offices he held, he found time for research in pharmacy (urinalysis and bacteriology)
	and mycology. Studer's extensive work on hymenomycetes is scientifically sound and valuable. He learnt
	watercolour painting and created impressive pictures which were donated to the Botanical Institute
	in Bern in 1912. In addition to his theoretical studies, he was also involved in practical work, published
	a book on edible mushrooms, held public mushroom courses and founded a mushroom inspection centre in
	Bern to promote edible mushrooms and dispel prejudices. The author abbreviation of Bernhard Studer-Steinhäuslin
	is Stud.-Steinh. (Clitocybe aurantiaca, Pourretia mexicana var. argentea). His numerous publications
	are listed in the obituary:
	<a href="https://www.e-periodica.ch/cntmng?pid=sng-005%3A1910%3A93%3A%3A905" target="_blank">
		A. Tschirch: Bernhard Studer-Steinhäuslin, Apotheker in Verhandlungen der Schweizerischen
		Naturforschenden Gesellschaft, 93, 1910, S. 36-42
	</a>.
	<p>
		The Herbarium Bernense contains 5 boxes with 1,245 mushroom illustrations by Bernhard
		Studer-Steinhäuslin. These are unique specimens that are listed in a catalogue compiled by
		Eduard Fischer in 1914.
	</p>
	<a href="https://www.e-periodica.ch/digbib/view?pid=mnb-001:1914:0::186#187" target="_blank">
		Die Hymenomyceten des bernischen Hügellandes zwischen Alpen und Jura, Mitt. Naturf. Ges. Bern,
		1914, 136-167
	</a>.
	<enhanced:img
		src="$lib/assets/Studer-Steinhäuslin.jpg"
		alt="Cortinarius traganus"
		class="max-w-full md:max-w-96 md:float-left mx-auto mt-4 md:my-4 md:mr-6 border-8 border-primary-500 anchor cursor-pointer"
		on:click={(e) => {
			openLightbox(e.target);
		}}
		on:keypress={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				openLightbox(e.target);
			}
		}}
		role="presentation"
	/>
	<p>
		On the back of some of the pictures there are comments by a researcher friend from
		French-speaking Switzerland. They are listed behind the annotated images. His wife, Julie Luise
		Studer-Steinhäuslin, was a member of the advisory commission of the League of Nations and
		campaigned for an international agreement on stricter laws against trafficking in women and
		children.
	</p>
</ContentContainer>
