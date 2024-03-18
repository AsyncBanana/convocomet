import type { APIRoute } from 'astro';

export const GET: APIRoute = (ctx) => {
	ctx.cookies.delete('authData', { path: '/' });
	return ctx.redirect(ctx.url.searchParams.get('redirect') || '/');
};
export const POST: APIRoute = (ctx) => {
	return new Response('Signed out', {
		headers: {
			'Set-Cookie':
				'authData=deleted; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure; HttpOnly=true;' // TODO Astro's cookie API does not support adding SameSite to deletions
		}
	});
};
