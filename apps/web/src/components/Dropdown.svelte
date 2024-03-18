<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { autoUpdate, computePosition } from '@floating-ui/dom';
	export let id: string;
	function roundByDPR(value) {
		const dpr = window.devicePixelRatio || 1;
		return Math.round(value * dpr) / dpr;
	}
	let dropdown: HTMLDivElement;
	let button: HTMLButtonElement;
	let cleanup;
	const eventHandlers: [string, EventListener, boolean?][] = [['click', toggleDialog]];
	function showDialog() {
		if (!dropdown.classList.contains('hidden')) return;
		cleanup = autoUpdate(button, dropdown, () => {
			computePosition(button, dropdown, {
				placement: 'bottom-end'
			}).then(({ x, y }) => {
				Object.assign(dropdown.style, {
					transform: `translate(${roundByDPR(x)}px,${roundByDPR(y)}px)`
				});
			});
		});
		dropdown.classList.remove('hidden');
	}
	function hideDialog() {
		if (dropdown.classList.contains('hidden')) return;
		dropdown.classList.add('hidden');
		cleanup();
	}
	function toggleDialog() {
		if (dropdown.classList.contains('hidden')) {
			showDialog();
		} else {
			hideDialog();
		}
	}
	onMount(() => {
		button = document.getElementById(id) as HTMLButtonElement;
		eventHandlers.forEach((handler) => button.addEventListener(...handler));
	});
	onDestroy(() => {
		if (import.meta.env.SSR) return;
		eventHandlers.forEach((handler) => button.removeEventListener(...handler));
		if (cleanup) cleanup();
	});
</script>

<div
	role="tooltip"
	id={id + 'Dropdown'}
	class="absolute top-0 left-0 w-max p-6 bg-base-2 rounded-md b-1 b-neutral-1 mt-2 hidden z-10"
	bind:this={dropdown}
	on:focusout={hideDialog}
>
	<slot />
</div>
