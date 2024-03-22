import type { APIRoute } from 'astro';

export const POST: APIRoute = async (context) => {
	const request = new Request(context.request);
	request.headers.delete('cookie');
	return await fetch('https://plausible.io/api/event', request);
};
