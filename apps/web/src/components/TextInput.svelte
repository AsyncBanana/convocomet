<script lang="ts">
	export let value: string = '';
	export let autocomplete = undefined;
	export let placeholder: string = undefined;
	export let description: string = undefined;
	export let required = false;
	export let maxlength: number = undefined;
	export let minlength: number = undefined;
	export let pattern: string = undefined;
	export let title: string = undefined;
	export let name: string = undefined;
	export let disabled: boolean = undefined;
	export let readonly: boolean = undefined;
	export let containerClass: string = '';
	export let id: string = undefined;
	export let type: 'text' | 'email' | 'url' = 'text';
	export let shadow = true;
	let className = '';
	function input(e) {
		value = (e.target as HTMLInputElement).value;
	}
	export { className as class };
</script>

<svelte:element
	this={$$slots.default ? 'label' : 'div'}
	class="flex flex-col md:my-3 {containerClass}"
>
	{#if $$slots.default}<div class="ml-2 text-lg font-500"><slot /></div>{/if}
	{#if description}<p class="text-gray-500 text-sm ml-2">{description}</p>{/if}
	<input
		{autocomplete}
		{placeholder}
		{required}
		{maxlength}
		{minlength}
		{pattern}
		{title}
		{name}
		{value}
		{type}
		{id}
		{disabled}
		{readonly}
		on:input
		on:input={input}
		class="rounded-md px-6 py-3 outline-none focus:outline-none b-1 b-neutral-1 bg-base-1 {shadow
			? '!shadow-md '
			: ''}focus:ring-2 ring-primary-medium duration-150 {className}"
	/>
</svelte:element>
