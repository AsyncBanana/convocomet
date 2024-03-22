import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import cloudflare from '@astrojs/cloudflare';
import unocss from 'unocss/astro';
import { visualizer } from 'rollup-plugin-visualizer';
import sitemap from '@astrojs/sitemap';
import { matchBlock } from './src/modules/indexBlockList';
import mjml from 'rollup-plugin-mjml-inline';

// https://astro.build/config
export default defineConfig({
	integrations: [
		unocss({
			injectReset: true
		}),
		svelte(),
		sitemap({
			filter: (url) => !matchBlock(url)
		})
	],
	output: 'server',
	adapter: cloudflare({
		mode: 'directory',
		runtime: {
			mode: 'local',
			type: 'pages'
		},
		routes: {
			strategy: 'exclude'
		}
	}),
	trailingSlash: 'never',
	site: import.meta.env.PROD ? 'https://convocomet.dev' : 'http://localhost:4321',
	vite: {
		plugins: [visualizer(), mjml()],
		resolve: {
			alias: [
				{
					find: '@libsql/client',
					replacement: import.meta.env.PROD ? 'libsql-stateless-easy' : '@libsql/client'
				}
			]
		}
	}
});
