import { defineMiddleware } from 'astro:middleware';
import { validateJWT } from 'oslo/jwt';
import { base64StringToUInt8Array } from './modules/utils';
import { UserTable } from './schemas/db/auth';
import { eq } from 'drizzle-orm';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';
// `context` and `next` are automatically typed
export const onRequest = defineMiddleware((ctx, next) => {
	lemonSqueezySetup({ apiKey: import.meta.env.LEMONSQUEEZY_KEY });
	ctx.locals.data = {};
	ctx.locals.rawDB = createClient({
		url: import.meta.env.DATABASE_URL,
		authToken: import.meta.env.DATABASE_TOKEN,
		intMode: 'number'
	});
	ctx.locals.db = drizzle(ctx.locals.rawDB);
	ctx.locals.parseSession = async () => {
		const jwt = ctx.cookies.get('authData')?.value;
		if (!jwt || jwt === '{}') return null;
		let decodedJWT;
		try {
			decodedJWT = await validateJWT(
				'HS256',
				base64StringToUInt8Array(import.meta.env.AUTH_SECRET),
				jwt
			);
		} catch (err) {
			console.log(err);
			return null;
		}
		return +decodedJWT.subject;
	};
	ctx.locals.getSession = async () => {
		if (ctx.locals.data.user) return ctx.locals.data.user;
		if (ctx.locals.data.user === null) return;
		const id = await ctx.locals.parseSession();
		if (!id) {
			ctx.locals.data.user = null;
			return;
		}
		ctx.locals.data.user = await ctx.locals.db
			.select()
			.from(UserTable)
			.where(eq(UserTable.id, id))
			.get();
		return ctx.locals.data.user;
	};
	// @ts-expect-error type issues
	ctx.locals.getBatchSession = async (query) => {
		const loadSession = !ctx.locals.data.user && ctx.locals.data.user !== null;
		const id = await ctx.locals.parseSession();
		if (!id) {
			ctx.locals.data.user = null;
		}
		if (query.length + (loadSession ? 1 : 0) < 2) {
			return { user: ctx.locals.data.user, data: [await query[0]] };
		}
		const res = await ctx.locals.db.batch([
			loadSession && ctx.locals.db.select().from(UserTable).where(eq(UserTable.id, id)),
			...query
		]);
		const user = loadSession ? res.shift()?.[0] : ctx.locals.data.user;
		return { user, data: res };
	};
	next();
});
