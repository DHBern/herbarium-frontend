// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	// interface Locals {}
	// interface PageData {}
	// interface Error {}
	// interface Platform {}
}

declare module '*.md' {
	import type { Component } from 'svelte';
	export const metadata: Record<string, unknown> | undefined;
	const component: Component;
	export default component;
}
