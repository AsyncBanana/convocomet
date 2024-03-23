import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'ConvoComet Documentation',
			social: {
				github: 'https://github.com/asyncbanana/convocomet'
			},
			sidebar: [
				{
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{
							label: 'Getting Started',
							link: '/guides/getting-started/'
						},
						{
							label: 'Creating a custom widget',
							link: '/guides/custom-widget'
						},
						{
							label: 'Self Hosting',
							link: '/guides/self-host'
						},
						{
							label: 'Importing Disqus Comments',
							link: '/guides/import-from-disqus'
						}
					]
				},
				{
					label: 'Reference',
					autogenerate: {
						directory: 'reference'
					}
				}
			]
		})
	],
	site: 'https://docs.convocomet.dev',
	redirects: {
		'/': '/guides/getting-started'
	}
});
