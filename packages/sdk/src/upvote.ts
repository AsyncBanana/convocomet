import type { Config } from './types';
import { DEFAULT_ENDPOINT } from './types';
export default async function upvote(commentId: number, config: Config): Promise<void> {
	const res = await fetch(`${config.endpoint || DEFAULT_ENDPOINT}/comment/${commentId}`, {
		method: 'PATCH',
		body: JSON.stringify({ type: 'upvote' }),
		headers: {
			'x-referer': top.location !== self.location ? document.referrer : self.location.origin
		}
	});
	if (!res.ok) {
		throw new Error(`Comment post request failed with error ${res.status.toString()}`);
	}
}
