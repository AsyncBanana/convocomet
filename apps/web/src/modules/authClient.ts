import type { UserTableSelect } from '../schemas/db/auth';
export interface SignInConfig {
	email?: string;
	callbackFn: CallbackFn;
}

export type CallbackFn = (user: UserTableSelect) => void;
function liveOAuthCallback(callbackFn: CallbackFn) {
	window.addEventListener('message', (e) => {
		if (e.data.type === 'signInCallback') {
			callbackFn(e.data.user);
		}
	});
}

async function liveSignIn(
	providerId: 'email',
	callbackFn: CallbackFn,
	data: {
		email: string;
		name: string;
		type: 'signup';
	}
);
async function liveSignIn(
	providerId: 'email',
	callbackFn: CallbackFn,
	data: {
		email: string;
		type: 'signin';
	}
): Promise<void>;
async function liveSignIn(providerId: 'github' | 'google', callbackFn: CallbackFn);
async function liveSignIn(
	providerId: 'github' | 'google' | 'email',
	callbackFn: CallbackFn,
	data?: {
		email: string;
		name?: string;
		type: 'signin' | 'signup';
	}
) {
	const url = new URL(`/api/auth/${data?.type || 'signin'}/${providerId}`, location.origin);
	url.searchParams.append('redirect', '/liveauthcallback');
	if (data?.email) url.searchParams.append('email', data.email);
	if (data?.name) url.searchParams.append('name', data.name);
	window.open(url);
	if (callbackFn) liveOAuthCallback(callbackFn);
}
export default liveSignIn;
