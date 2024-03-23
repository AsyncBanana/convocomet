// @unocss-include
import { cva } from 'cva';

export const button = cva({
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
