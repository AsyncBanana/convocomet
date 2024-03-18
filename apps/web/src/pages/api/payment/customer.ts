import type { APIRoute } from 'astro';
import { UserTable } from '../../../schemas/db/auth';
import { eq } from 'drizzle-orm';
import { decodeHex } from 'oslo/encoding';
import type { SubscriptionItem } from '@lemonsqueezy/lemonsqueezy.js';
export const ALL: APIRoute = async (ctx) => {
	const event = ctx.request.headers.get('X-Event-Name');
	if (event !== 'subscription_created' && event !== 'subscription_updated')
		return new Response('Event not tracked', { status: 418 });
	const rawSignature = ctx.request.headers.get('X-Signature');
	const rawBody = await ctx.request.text();
	if (!rawSignature) return new Response('Missing signature', { status: 400 });
	const encoder = new TextEncoder();
	if (
		!(await crypto.subtle.verify(
			{ name: 'HMAC', hash: 'SHA-256' },
			await crypto.subtle.importKey(
				'raw',
				encoder.encode(import.meta.env.LEMONSQUEEZY_WEBHOOK_KEY),
				{ name: 'HMAC', hash: 'SHA-256' },
				false,
				['verify']
			),
			decodeHex(rawSignature),
			encoder.encode(rawBody)
		))
	)
		return new Response('Invalid signature', { status: 400 });
	const body = JSON.parse(rawBody) as {
		meta: {
			custom_data?: {
				userID?: string;
			};
		};
		data: SubscriptionItem['data'];
	};
	if (!body.meta?.custom_data?.userID) return new Response('No userId', { status: 400 });
	const res = await ctx.locals.db
		.update(UserTable)
		.set({
			paymentId: body.data.id
		})
		.where(eq(UserTable.id, +body.meta.custom_data.userID));
	if (res.rowsAffected === 0) return new Response('User not found', { status: 400 });
	return new Response('Created customer', { status: 200 });
};
