<script lang="ts">
	export let value;
	export let options: [string, string][];
	export let name: string;
	export let id: string;
	export { className as class };
	let className = '';
</script>

<select
	{name}
	{id}
	bind:value
	class="{className} b-1 b-neutral-1 hover:bg-base-focus bg-transparent rounded-md p-3 font-600 transition-all duration-200 flex flex-row items-center justify-center w-max"
>
	{#each options as option}
		<option class="p-3" value={option[1]}>{option[0]}</option>
	{/each}
</select>
