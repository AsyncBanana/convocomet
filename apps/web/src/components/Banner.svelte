<script lang="ts">
	import { fly } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';
	import Button from './Button.svelte';
	export let type: 'warning' | 'info' | 'success' | 'error' = 'info';
	export let floating = true;
	export { className as class };
	let className: string = '';
	const typeColor = {
		error: 'bg-red-700',
		info: 'bg-blue-700',
		warning: 'bg-yellow-700',
		success: 'bg-green-700'
	};
	const focusColor = {
		error: '!hover:bg-red-900',
		info: '!hover:bg-blue-900',
		warning: '!hover:bg-yellow-900',
		success: '!hover:bg-green-900'
	};
	const typeIcons = {
		error: 'i-ic:outline-warning',
		warning: 'i-ic:outline-warning'
	};
	const dispatch = createEventDispatcher();
</script>

<div
	transition:fly={{ duration: 200, y: 100 }}
	class="{typeColor[type]} {className} {floating
		? 'md:w-3/4 md:rounded-md pointer-events-auto select-auto z-10 mx-auto'
		: 'w-max rounded-md'} items-center flex p-3 font-bold text-white text-lg"
	inert={false}
>
	{#if typeIcons[type]}<span class="{typeIcons[type]} mr-1" />{/if}
	<slot />
	<Button
		on:click={(e) => dispatch('exit', e)}
		class="mr-0 ml-auto h-full {focusColor[type]}"
		type="borderless"
		icon="i-mdi:close"
	></Button>
</div>
