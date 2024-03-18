<script lang="ts">
	export let checked = false;
	export let description: string = undefined;
	export let name: string;
	let className = '';
	export { className as class };
</script>

<label class="flex my-6 items-center">
	<input
		type="checkbox"
		value="true"
		bind:checked
		{name}
		class="rounded-lg b-1 b-neutral-1 py-3 w-auto aspect-square h-6 accent-primary-medium {className}"
	/>
	<div class="flex flex-col ml-2">
		<div class="text-lg font-500"><slot /></div>
		{#if description}<div class="text-gray-500 text-sm">{description}</div>{/if}
	</div>
</label>
