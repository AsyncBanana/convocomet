import type { APIRoute } from 'astro';
import { parseRequestBody } from '../../../../modules/utils';
import { assert } from 'superstruct';
import { SignUpEmailSchema } from '../../../../schemas/validation/user';
import { sendEmail } from '../../../../modules/email';
import { eq } from 'drizzle-orm';
import { Action, UserTable, VerificationTokenTable } from '../../../../schemas/db/auth';
import { alphabet, generateRandomString } from 'oslo/crypto';
import verifyEmailTemplate from '../../../../templates/html/verifyEmail.html?raw';
export const ALL: APIRoute = async (ctx) => {
	if (ctx.request.method !== 'POST' && ctx.request.method !== 'GET')
		return new Response('Invalid request type', { status: 400 });
	const { provider } = ctx.params;
	const redirectURI = ctx.url.searchParams.get('redirect');
	if (redirectURI) {
		ctx.cookies.set('authRedirectURI', redirectURI, {
			secure: true,
			httpOnly: true,
			path: '/api/auth/callback',
			expires: new Date(Date.now() + 3600000 /* 1 hour */)
		});
	}
	if (provider === 'email') {
		const body = await parseRequestBody(ctx.request);
		if (body instanceof Response) {
			return body;
		}
		// biome-ignore lint/performance/noDelete: Superstruct detects undefined
		delete body.redirect;
		try {
			assert(body, SignUpEmailSchema);
		} catch (error) {
			return new Response(JSON.stringify(error.failures()), {
				status: 400,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}
		const user = await ctx.locals.db
			.select({ id: UserTable.id })
			.from(UserTable)
			.where(eq(UserTable.email, body.email))
			.get();
		if (user) return new Response('Account already exists for that email');
		const token = generateRandomString(32, alphabet('A-Z', '0-9'));
		const expires = new Date();
		expires.setUTCSeconds(expires.getUTCSeconds() + 36000);
		await ctx.locals.db
			.insert(VerificationTokenTable)
			.values({
				identifier: body.email,
				type: Action.signup,
				name: body.name,
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
		const res = await sendEmail({
			personalizations: {
				to: [{ email: body.email, name: body.name }]
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
		if (!res.success) return new Response('Error sending email', { status: 500 });
		return ctx.redirect('/checkemail');
	}
	return new Response('Invalid provider passed', {
		status: 400
	});
};
