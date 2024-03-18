<script script lang="ts">
	import { cva, type VariantProps } from 'cva';
	const button = cva({
		variants: {
			type: {
				primary: 'bg-primary-dark text-white',
				secondary: 'bg-base-focus b-1 b-neutral-1 shadow-md',
				tertiary: 'b-1 b-neutral-1',
				borderless: 'hover:bg-base-focus',
				link: 'hover:underline focus:underline p-2'
			},
			size: {
				full: 'w-full',
				max: 'w-max',
				square: null
			},
			state: {
				default: null,
				disabled: 'pointer-events-none'
			}
		},
		compoundVariants: [
			{ type: 'primary', state: 'default', class: 'hover:shadow-lg hover:bg-primary-ultradark' },
			{
				type: 'tertiary',
				state: 'default',
				class: 'hover:bg-base-focus'
			},
			{
				type: 'tertiary',
				state: 'disabled',
				class: 'bg-base-focus'
			},
			{
				type: ['primary', 'secondary', 'tertiary', 'borderless'], // type !== "link",
				class: 'ring-primary-medium focus:ring-2 justify-center font-600 p-4'
			},
			{
				type: ['primary', 'secondary', 'tertiary', 'borderless'], // type !== "link",
				size: ['full', 'max'], // !square
				class: 'px-6'
			},
			{
				type: 'link',
				size: ['full', 'max'], // !square
				class: 'px-4'
			}
		],
		defaultVariants: { type: 'primary', size: 'max', state: 'default' },
		base: 'rounded-md transition-all duration-150 flex items-center flex-row outline-none focus:outline-none text-center'
	});
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
