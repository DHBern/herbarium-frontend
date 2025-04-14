import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vite';
import dsv from '@rollup/plugin-dsv';

export default defineConfig({
	plugins: [enhancedImages(), dsv(), sveltekit(), purgeCss()],
	
	build: {
		target: 'esnext',
		minify: true,
		sourcemap: true
	},
	optimizeDeps: {
		exclude: ['@sveltejs/kit']
	},
	resolve: {
		conditions: ['browser', 'development', 'module', 'default'] // Ensure proper module resolution
	}
});
