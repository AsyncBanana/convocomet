<script lang="ts">
	export let href: string = undefined;
	export let src: string;
	export let ariaDescribedby: string = undefined;
	export let id: string;
	let className = '';
	export { className as class };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<svelte:element
	this={href ? 'a' : 'button'}
	{href}
	{id}
	class="hover:bg-base-focus rounded-full block font-600 transition-all duration-200 b-neutral-1 flex place-items-center place-content-center b-1 p-1 {className}"
	on:click
	aria-describedby={ariaDescribedby}
>
	<img {src} class="rounded-full aspect-square" alt={'User avatar'} />
	<slot />
</svelte:element>
