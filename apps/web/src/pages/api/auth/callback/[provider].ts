import type { APIRoute } from 'astro';
import {
	type GitHubToken,
	getController,
	type GitHubUserData,
	type GoogleToken,
	type GoogleJWT
} from '../../../../modules/auth';
import {
	AccountTypes,
	UserTable,
	VerificationTokenTable,
	type UserTableSelect,
	Action
} from '../../../../schemas/db/auth';
import { and, eq } from 'drizzle-orm';
import { createJWT, parseJWT } from 'oslo/jwt';
import { base64StringToUInt8Array } from '../../../../modules/utils';
import { TimeSpan } from 'oslo';
export const GET: APIRoute = async (ctx) => {
	const { provider } = ctx.params;
	const redirectURI = ctx.cookies.get('authRedirectURI');
	ctx.cookies.delete('authRedirectURI');
	let user: UserTableSelect;
	if (provider === 'github') {
		const code = ctx.url.searchParams.get('code');
		const state = ctx.url.searchParams.get('state');
		const storedState = ctx.cookies.get('authState').value;
		if (!state || state !== storedState)
			return new Response('Invalid state', {
				status: 400
			});
		const oauthController = getController(provider);
		const token = await oauthController.validateAuthorizationCode<GitHubToken>(code, {
			credentials: import.meta.env.GITHUB_SECRET
		});
		const scopes = token.scope.split(',');
		if (!(scopes.includes('read:user') && scopes.includes('user:email')))
			return new Response('Required scopes missing');
		const OAuthUser = await (
			await fetch('https://api.github.com/user', {
				headers: {
					Authorization: `Bearer ${token.access_token}`,
					'User-Agent': 'ConvoComet'
				}
			})
		).json<GitHubUserData>();
		user = await ctx.locals.db
			.select()
			.from(UserTable)
			.where(and(eq(UserTable.accountId, OAuthUser.id), eq(UserTable.type, AccountTypes[provider])))
			.get();
		if (!user) {
			try {
				user = await ctx.locals.db
					.insert(UserTable)
					.values({
						email: OAuthUser.email,
						name: OAuthUser.name || OAuthUser.login,
						emailVerified: true,
						image: OAuthUser.avatar_url,
						type: AccountTypes.github,
						accountId: OAuthUser.id
					})
					.returning()
					.get();
			} catch (err) {
				console.log(err);
				return new Response('Error signing in; Check you are using the correct provider');
			}
		}
		ctx.cookies.delete('authState');
	} else if (provider === 'google') {
		const code = ctx.url.searchParams.get('code');
		const state = ctx.url.searchParams.get('state');
		const storedState = ctx.cookies.get('authState').value;
		if (!state || state !== storedState)
			return new Response('Invalid state', {
				status: 400
			});
		const oauthController = getController(provider);
		const token = await oauthController.validateAuthorizationCode<GoogleToken>(code, {
			credentials: import.meta.env.GOOGLE_OAUTH_SECRET
		});
		const scopes = token.scope.split(' ');
		if (
			!(
				scopes.includes('https://www.googleapis.com/auth/userinfo.email') &&
				scopes.includes('openid') &&
				scopes.includes('https://www.googleapis.com/auth/userinfo.profile')
			)
		)
			return new Response('Required scopes missing');
		const OAuthUserJWT = parseJWT(token.id_token) as GoogleJWT;
		user = await ctx.locals.db
			.select()
			.from(UserTable)
			.where(
				and(
					eq(UserTable.accountId, OAuthUserJWT.subject),
					eq(UserTable.type, AccountTypes[provider])
				)
			)
			.get();
		if (!user) {
			try {
				user = await ctx.locals.db
					.insert(UserTable)
					.values({
						email: OAuthUserJWT.payload.email,
						name: OAuthUserJWT.payload.name || OAuthUserJWT.payload.email,
						emailVerified: true,
						image: OAuthUserJWT.payload.picture,
						type: AccountTypes.google,
						accountId: OAuthUserJWT.subject
					})
					.returning()
					.get();
			} catch (err) {
				console.log(err);
				return new Response('Error signing in; Check you are using the correct provider');
			}
		}
		ctx.cookies.delete('authState');
	} else if (provider === 'email') {
		const token = ctx.url.searchParams.get('token');
		if (!token) return new Response('No token provided', { status: 400 });
		const tokenData = await ctx.locals.db
			.delete(VerificationTokenTable)
			.where(eq(VerificationTokenTable.token, token))
			.returning()
			.get();
		if (!tokenData) return new Response('No token found', { status: 404 });
		if (tokenData.expires < new Date()) return new Response('Token expired', { status: 400 });
		user = await ctx.locals.db
			.select()
			.from(UserTable)
			.where(eq(UserTable.email, tokenData.identifier))
			.get();
		if (!user) {
			if (tokenData.type !== Action.signup || !('name' in tokenData))
				return new Response('Invalid token', { status: 400 });
			user = await ctx.locals.db
				.insert(UserTable)
				.values({
					type: AccountTypes.email,
					name: tokenData.name,
					email: tokenData.identifier,
					emailVerified: true
				})
				.returning()
				.get();
		} else {
			if (user.type !== AccountTypes.email)
				return new Response('User uses non OAuth provider', { status: 400 });
			if (tokenData.type !== Action.signin) return new Response('Invalid token', { status: 400 });
		}
	} else {
		return new Response('Invalid OAuth method', { status: 400 });
	}
	const expiration = new TimeSpan(24, 'h');
	ctx.cookies.set(
		'authData',
		await createJWT(
			'HS256',
			base64StringToUInt8Array(import.meta.env.AUTH_SECRET),
			{},
			{
				subject: user.id.toString(),
				expiresIn: expiration
			}
		),
		{ path: '/', maxAge: expiration.seconds(), httpOnly: true, secure: true, sameSite: 'none' }
	);
	return ctx.redirect(redirectURI?.value || '/dashboard');
};
