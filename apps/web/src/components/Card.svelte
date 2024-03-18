<script lang="ts">
	export let href: string = undefined;
	export let header: string;
	let staticEl = false;
	let className = '';
	export { className as class, staticEl as static };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<svelte:element
	this={staticEl ? 'div' : href ? 'a' : 'button'}
	on:click
	role={staticEl ? 'Static card' : 'Interactive card'}
	{href}
	class="rounded-lg shadow-md p-6 bg-base-3 {className}"
>
	<h2 class="font-700 text-lg text-center">{header}</h2>
	<div><slot /></div>
</svelte:element>
