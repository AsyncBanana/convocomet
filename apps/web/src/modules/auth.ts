import type { JWT } from 'oslo/jwt';
import { OAuth2Client } from 'oslo/oauth2';
export function getController(type: 'google' | 'github'): OAuth2Client {
	if (type === 'github') {
		return new OAuth2Client(
			import.meta.env.GITHUB_ID,
			'https://github.com/login/oauth/authorize',
			'https://github.com/login/oauth/access_token',
			{
				redirectURI: `${import.meta.env.SITE}/api/auth/callback/${type}`
			}
		);
	}
	if (type === 'google') {
		return new OAuth2Client(
			import.meta.env.GOOGLE_OAUTH_ID,
			'https://accounts.google.com/o/oauth2/v2/auth',
			'https://oauth2.googleapis.com/token',
			{
				redirectURI: `${import.meta.env.SITE}/api/auth/callback/${type}`
			}
		);
	}
}
export interface GitHubToken {
	access_token: string;
	token_type: 'Bearer';
	scope: string;
}
export interface GoogleToken {
	access_token: string;
	token_type: 'Bearer';
	scope: string;
	id_token: string;
	expires_in: number;
}
export interface GitHubUserData {
	// Does not include all fields
	login: string;
	id: string;
	avatar_url: string;
	url: string;
	html_url: string;
	type: 'User';
	site_admin: boolean;
	name?: string;
	company?: string;
	blog?: string;
	location?: string;
	email: string;
	bio?: string;
}
export interface GoogleJWT extends JWT {
	payload: {
		email: string;
		email_verified: boolean;
		picture?: string;
		profile?: string;
		name?: string;
		family_name?: string;
		given_name?: string;
		locale?: string;
	};
}
