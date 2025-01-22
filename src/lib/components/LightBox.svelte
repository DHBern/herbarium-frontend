<!-- //<---------------------- ightBox start -------------------------------> -->
<script>
// @ts-nocheck

    import {selectedImagePath} from '$lib/stores';
    import {closeLightbox} from '$lib/functions';
    import { fade, slide } from 'svelte/transition';
</script>
{#if $selectedImagePath != ""}
		<!-- <div class="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50 cursor-pointer " role="button" tabindex="0"  -->
			<div class="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 cursor-pointer -top-10" role="button" tabindex="0" 
			  onclick={closeLightbox} 
			   onkeydown={(e) => { 
			 if (e.key === 'Enter' || e.key === 'Space') {
					  closeLightbox();	
				 }
			   }} 
			  aria-label="Close lightbox"
			 
			  >
			  <button class="absolute top-14 right-10 p-3 bg-white/40 rounded-md shadow-lg text-white hover:bg-gray-200 hover:text-black transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500" onclick={closeLightbox}>
				<span class="text-xl font-bold">X</span>
			  </button>
			  <img
			  src={$selectedImagePath}
			  alt="Lightbox view"
			  class="max-w-[90%] max-h-[90vh] h-auto rounded-lg object-contain"
			  in:slide={{ x: 200, duration: 600 }}
			  out:fade={{ duration: 600 }} 
			/>
			
			 </div>	 
	
		{/if}
<!-- //<---------------------- ightBox start -------------------------------> -->		