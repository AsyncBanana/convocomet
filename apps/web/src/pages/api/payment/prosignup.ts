import { getSubscription } from '@lemonsqueezy/lemonsqueezy.js';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (ctx) => {
	const user = await ctx.locals.getSession();
	if (!user) {
		return ctx.redirect(`/signin?redirect=${encodeURIComponent('/api/payment/prosignup')}`);
	}
	if (user.paymentId) {
		try {
			const subscription = await getSubscription(user.paymentId);
			if (subscription.data.data.attributes.cancelled) {
				return ctx.redirect('/dashboard/settings');
			}
		} catch {}
	}
	return ctx.redirect(
		`${import.meta.env.PUBLIC_LEMONSQUEEZY_CHECKOUT_URL}?checkout[email]=${encodeURIComponent(
			user.email
		)}&checkout[custom][userID]=${encodeURIComponent(user.id)}`
	);
};
