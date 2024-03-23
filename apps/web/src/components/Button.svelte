<script script lang="ts">
	import { type VariantProps } from 'cva';
	import { button } from '../stylesheets/cva/button';
	type ButtonProps = VariantProps<typeof button>;
	export let href: string = undefined;
	export let type: ButtonProps['type'] = 'primary';
	export let icon: string = undefined;
	export let ariaLabel: string = undefined;
	export let disabled: boolean = undefined;
	export let action: 'button' | 'submit' | 'reset' = undefined;
	export let title: string = undefined;
	export let size: ButtonProps['size'] = $$slots.default ? 'max' : 'square';
	export let id: string = undefined;
	export let value: string = undefined;
	export let loading: boolean = false;
	export let customAttributes: Record<string, string> = {};
	let className = '';
	export { className as class };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<svelte:element
	this={href ? 'a' : 'button'}
	class={button({ type, size, state: disabled ? 'disabled' : 'default', className })}
	on:click
	on:mousedown
	on:mouseup
	aria-label={ariaLabel}
	type={action}
	{disabled}
	{href}
	{title}
	{id}
	{value}
	{...customAttributes}
	>{#if loading}<span class="loading" />{/if}{#if icon}<div
			class="{icon} inline-block {$$slots.default ? 'mr-1' : ''}"
		/>{/if}
	<span><slot /></span>
</svelte:element>

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
