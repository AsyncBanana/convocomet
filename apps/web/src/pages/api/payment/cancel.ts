import { cancelSubscription } from '@lemonsqueezy/lemonsqueezy.js';
import type { APIRoute } from 'astro';
import { UserTable } from '../../../schemas/db/auth';

export const GET: APIRoute = async (ctx) => {
	const user = await ctx.locals.getSession();
	if (!user) {
		return ctx.redirect('/signin');
	}
	if (!user.paymentId) {
		return new Response('No subscription attached', { status: 403 });
	}
	const res = await cancelSubscription(user.paymentId);
	if (res.statusCode !== 200) {
		console.error(`Error cancelling subscription: ${res.error.message}`);
		return new Response('Error cancelling subscription', { status: 500 });
	}
	return ctx.redirect('/dashboard/settings');
};
