import type { APIRoute } from 'astro';
import WidgetScript from '@convocomet/web?raw';

export const GET: APIRoute = () => {
	return new Response(WidgetScript, {
		headers: {
			'Content-Type': 'text/javascript'
		}
	});
};
export const prerender = true;
