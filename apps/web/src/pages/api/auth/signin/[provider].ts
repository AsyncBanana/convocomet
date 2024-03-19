import type { APIRoute } from 'astro';
import { parseRequestBody } from '../../../../modules/utils';
import { assert } from 'superstruct';
import { SignInEmailSchema } from '../../../../schemas/validation/user';
import { getController } from '../../../../modules/auth';
import { generateState } from 'oslo/oauth2';
import { sendEmail } from '../../../../modules/email';
import {
	AccountTypes,
	Action,
	UserTable,
	VerificationTokenTable
} from '../../../../schemas/db/auth';
import { and, eq } from 'drizzle-orm';
import { generateRandomString, alphabet } from 'oslo/crypto';
import verifyEmailTemplate from '../../../../templates/html/verifyEmail.html?raw';
export const ALL: APIRoute = async (ctx) => {
	const redirectURI = ctx.url.searchParams.get('redirect');
	if (redirectURI) {
		ctx.cookies.set('authRedirectURI', redirectURI, {
			secure: true,
			httpOnly: true,
			path: '/api/auth/callback',
			expires: new Date(Date.now() + 3600000 /* 1 hour */)
		});
	}
	if (ctx.request.method !== 'POST' && ctx.request.method !== 'GET')
		return new Response('Invalid request type', { status: 405 });
	const { provider } = ctx.params;
	if (provider === 'email') {
		const body = await parseRequestBody(ctx.request);
		if (body instanceof Response) {
			return body;
		}
		// biome-ignore lint/performance/noDelete: superstruct detects undefined
		delete body.redirect;
		try {
			assert(body, SignInEmailSchema);
		} catch (error) {
			return new Response(JSON.stringify(error.failures()), {
				status: 400,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}
		const user = await ctx.locals.db
			.select({ id: UserTable.id, name: UserTable.name, type: UserTable.type })
			.from(UserTable)
			.where(and(eq(UserTable.email, body.email)))
			.get();
		if (!user) return new Response('Please create an account', { status: 400 });
		if (user.type !== AccountTypes.email)
			return new Response('Incorrect login provider; Try using an OAuth provider', { status: 400 });
		const token = generateRandomString(32, alphabet('A-Z', '0-9'));
		const expires = new Date();
		expires.setUTCSeconds(expires.getUTCSeconds() + 36000);
		await ctx.locals.db
			.insert(VerificationTokenTable)
			.values({
				identifier: body.email,
				type: Action.signin,
				token,
				expires
			})
			.onConflictDoUpdate({
				set: {
					token,
					expires
				},
				target: VerificationTokenTable.identifier
			});
		await sendEmail({
			personalizations: {
				to: [{ email: body.email, name: user.name }]
			},
			from: { email: 'signin@convocomet.dev', name: 'ConvoComet Signin' },
			subject: 'Verify your email to sign in & comment',
			content: [
				{
					type: 'text/html',
					value: verifyEmailTemplate.replace(
						'{{verifyUrl}}',
						`${ctx.site}api/auth/callback/email?token=${token}`
					)
				}
			]
		});
		return ctx.redirect('/checkemail');
	}
	if (provider === 'google' || provider === 'github') {
		const auth = getController(provider);
		const state = generateState();
		const expires = new Date();
		expires.setUTCMinutes(expires.getUTCMinutes() + 10);
		ctx.cookies.set('authState', state, {
			httpOnly: true,
			secure: true,
			expires,
			path: '/api/auth/callback'
		});
		const url = await auth.createAuthorizationURL({
			scopes: provider === 'github' ? ['user:email', 'read:user'] : ['email', 'openid', 'profile']
		});
		url.searchParams.set('state', state);
		return ctx.redirect(url.toString());
	}
	return new Response('Invalid provider passed', {
		status: 400
	});
};
