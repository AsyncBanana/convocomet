import { defineConfig, presetIcons, presetUno, transformerDirectives } from 'unocss';
import { readFileSync } from 'fs';
import presetTheme from 'unocss-preset-theme';
import extractorSvelte from '@unocss/extractor-svelte';
import { resolve } from 'path';
const base = {
	colors: {
		primary: {
			ultralight: 'hsl(193, 100%, 70%)',
			light: 'hsl(193, 99%, 60%)',
			medium: 'hsl(193, 99%, 50%)',
			gradient: {
				medium: {
					start: 'hsl(183,100%,50%)',
					end: 'hsl(193%,99%,58%)'
				},
				dark: {
					start: 'hsl(183,100%,40%)',
					end: 'hsl(193,99%,48%)'
				},
				ultradark: {
					start: 'hsl(183,100%,30%)',
					end: 'hsl(193,99%,38%)'
				},
				darkest: {
					start: 'hsl(183,100%,25%)',
					end: 'hsl(193,99%,33%)'
				}
			},
			dark: 'hsl(193, 99%, 40%)',
			ultradark: 'hsl(193, 99%, 30%)'
		}
	},
	fontFamily: {
		display: "'Inter', sans-serif"
	}
};
const light = {
	colors: {
		base: {
			1: 'hsl(0,0%,100%)',
			focus: 'hsl(240,3.7%,90%)',
			2: 'hsl(0,0%,100%)',
			3: 'hsl(0,0%,100%)'
		},
		neutral: {
			1: 'hsl(240,3.7%,85%)',
			2: 'hsl(240,3.7%,75%)',
			3: 'hsl(240,3.7%,65%)',
			4: 'hsl(240,3.7%,55%)'
		},
		content: {
			base: 'black'
		}
	}
};
const dark = {
	colors: {
		base: {
			1: 'hsl(240,3.7%,7.5%)',
			focus: 'hsl(240,3.7%,7.5%)',
			2: 'hsl(240,3.7%,12.5%)',
			3: 'hsl(240,3.7%,17.5%)'
		},
		neutral: {
			1: 'hsl(240,3.7%,22.5%)',
			2: 'hsl(240,3.7%,32.5%)',
			3: 'hsl(240,3.7%,42.5%)',
			4: 'hsl(240,3.7%,52.5%)'
		},

		content: {
			base: 'white'
		}
	}
};
export default defineConfig({
	theme: { ...base, ...light, colors: { ...base.colors, ...light.colors } },
	shortcuts: {
		'w-main': 'xl:w-1/2 md:w-3/4 w-full m-auto p-3',
		'w-main-small': '2xl:w-1/5 xl:w-1/4 lg:w-1/3 md:w-1/2 w-full m-auto p-3',
		'gradient-primary': 'from-primary-gradient-medium-start to-primary-gradient-medium-end',
		'gradient-primary-dark': 'from-primary-gradient-dark-start to-primary-gradient-dark-end',
		'gradient-primary-ultradark':
			'from-primary-gradient-ultradark-start to-primary-gradient-ultradark-end',
		'gradient-primary-darkest':
			'from-primary-gradient-darkest-start to-primary-gradient-darkest-end'
	},
	presets: [
		presetIcons({
			cdn: 'https://esm.sh/',
			collections: {
				custom: {
					logo: readFileSync(resolve('public/logo.svg'), 'utf-8'),
					'logo-dark': readFileSync(resolve('public/logo-dark.svg'), 'utf-8')
				}
			}
		}),
		presetUno({
			extractors: [extractorSvelte],
			dark: 'media'
		}),
		presetTheme({
			theme: {
				dark,
				darkOverride: dark,
				lightOverride: light
			},
			prefix: '--upt'
		})
	],
	transformers: [transformerDirectives()]
});
