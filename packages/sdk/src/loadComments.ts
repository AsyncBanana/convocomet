import type { Config } from './types';
import { DEFAULT_ENDPOINT } from './types';
import type { Comment } from './types';
export default async function loadComments(
	config: Config,
	order?: 'newest' | 'oldest' | 'top',
	continuation = ''
): Promise<{ comments: Comment[]; continuation?: string }> {
	const searchparams = new URLSearchParams();
	if (order) searchparams.append('order', order);
	if (continuation) searchparams.append('continuation', continuation);
	const res = await fetch(
		`${config.endpoint !== null ? config.endpoint : DEFAULT_ENDPOINT}/comments/${
			config.id
		}/${encodeURIComponent(config.page)}?${searchparams.toString()}`,
		{
			headers: {
				'X-Referer': globalThis?.document?.referrer
			}
		}
	);
	if (!res.ok) {
		throw new Error(`Comment load request failed with error ${res.status.toString()}`);
	}
	try {
		return await res.json();
	} catch (err) {
		throw new Error(`Error parsing comment loading response JSON: ${err}`);
	}
}
