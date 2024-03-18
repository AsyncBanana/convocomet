<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import Button from './Button.svelte';
	let dialog: HTMLDialogElement;
	function monitorEscape(e: KeyboardEvent) {
		if (e.key === 'Escape' && dialog.open === true) {
			dialog.close('Exit via esc');
		}
	}
	onMount(() => {
		if (import.meta.env.SSR) return;
		window.addEventListener('keypress', monitorEscape);
	});
	onDestroy(() => {
		if (import.meta.env.SSR) return;
		window.removeEventListener('keypress', monitorEscape);
	});
	export const showModal = () => {
		dialog.showModal();
	};
	export const close = (reason) => dialog.close(reason || 'exited');
	export let id: string = undefined;
</script>

<dialog
	bind:this={dialog}
	{id}
	class="rounded-md w-full md:max-w-max md:w-xl lg:w-2xl text-content-base bg-base-2 p-3 b-1 b-neutral-1"
	transition:fly={{ y: 200, duration: 500 }}
>
	{#if $$slots.header}
		<header class="mb-3 flex flex-row place-items-center">
			<div class="grow">
				<h2 class="text-xl font-bold font-display"><slot name="header" /></h2>
				{#if $$slots.subheader}<h3 class="font-normal font-display text-gray-500">
						<slot name="subheader" />
					</h3>{/if}
			</div>
			<form method="dialog"><Button type="borderless" size="square" icon="i-mdi:close" /></form>
		</header>
	{/if}
	<article><slot /></article>
	{#if $$slots.action}
		<footer><form method="dialog" class="flex flex-row gap-3"><slot name="action" /></form></footer>
	{/if}
</dialog>

<style>
	dialog::backdrop {
		backdrop-filter: blur(25px);
	}
	:global(html:has(dialog[open])) {
		overflow: hidden;
	}
	@keyframes slidein {
		from {
			opacity: 0;
			transform: translateY(50%);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	dialog[open] {
		animation: slidein 250ms cubic-bezier(0.25, 0, 0.3, 1) normal;
	}
</style>
