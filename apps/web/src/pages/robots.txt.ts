import type { APIRoute } from 'astro';
import { indexBlockList } from '../modules/indexBlockList';
console.log(import.meta.env.DATABASE_URL);
export const GET: APIRoute = () => {
	return new Response(
		`
User-agent: *
Allow: /
${indexBlockList.map((block) => `Disallow: ${block}`).join('\n')}
Sitemap: ${new URL('sitemap-index.xml', import.meta.env.SITE).href}`.trim()
	);
};
export const prerender = true;
