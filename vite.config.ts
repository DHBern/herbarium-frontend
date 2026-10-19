import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vite';
import dsv from '@rollup/plugin-dsv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const markdownLayout = path.join(__dirname, 'src/lib/components/MarkdownLayout.svelte');

export default defineConfig({
	plugins: [
		enhancedImages(),
		dsv(),
		sveltekit({
			extensions: ['.svelte', '.md'],
			compilerOptions: { experimental: { async: true } },
			preprocess: [vitePreprocess(), mdsvex({ extensions: ['.md'], layout: markdownLayout })],
			inspector: true,
			adapter: adapter({ fallback: '404.html' }),
			paths: {
				base: process.argv.includes('dev') ? '' : process.env.BASE_PATH
			}
		}),
		tailwindcss()
	],
	build: { target: 'esnext', minify: true, sourcemap: true },
	optimizeDeps: { exclude: ['@sveltejs/kit'] },
	resolve: {
		conditions: [
			'browser',
			'development',
			'module',
			'default'
		] /* Ensure proper module resolution */
	}
});
