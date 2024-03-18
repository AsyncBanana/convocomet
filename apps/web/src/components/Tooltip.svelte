<script lang="ts">
	import { computePosition } from '@floating-ui/dom';
	import { onMount } from 'svelte';
	export let target: HTMLElement;
	let tooltip: HTMLDivElement;
	onMount(() => {
		computePosition(target, tooltip).then(({ x, y }) => {
			Object.assign(tooltip.style, {
				left: `${x}px`,
				top: `${y}px`
			});
		});
	});
</script>

<div bind:this={tooltip} class="absolute w-max top-0 left-0 bg-base-2">
	<slot />
</div>
