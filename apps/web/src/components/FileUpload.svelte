<script lang="ts">
	import { button } from '../stylesheets/cva/button';
	export let name: string = undefined;
	export let id: string;
	export let accept: string[] = undefined;
	export let loading = false;
</script>

<label for={id} class={button({ class: 'cursor-pointer' })}>
	{#if loading}<span class="loading" />{/if}
	<slot />
</label>
<input
	type="file"
	class="opacity-0 w-1 h-1 overflow-hidden"
	{name}
	accept={accept ? accept.join(',') : undefined}
	{id}
	on:change
/>

<style>
	.loading {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		margin-right: 3px;
		position: relative;
		animation: rotate 1s linear infinite;
	}
	.loading::before {
		content: '';
		box-sizing: border-box;
		position: absolute;
		inset: 0px;
		border-radius: 50%;
		border: 3px solid #fff;
		animation: prixClipFix 2s linear infinite;
	}

	@keyframes rotate {
		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes prixClipFix {
		0% {
			clip-path: polygon(50% 50%, 0 0, 0 0, 0 0, 0 0, 0 0);
		}
		25% {
			clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 0, 100% 0, 100% 0);
		}
		50% {
			clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 100% 100%, 100% 100%);
		}
		75% {
			clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 100%);
		}
		100% {
			clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 0);
		}
	}
</style>
