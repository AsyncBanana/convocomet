import type { Config, Comment } from './types';
import { DEFAULT_ENDPOINT } from './types';
export interface CommentData {
	text: string;
	author?: string;
	notifications: boolean;
	sourceId?: number;
}
export default async function postComment(comment: CommentData, config: Config): Promise<Comment> {
	const res = await fetch(
		`${config.endpoint || DEFAULT_ENDPOINT}/comments/${config.id}/${encodeURIComponent(
			config.page
		)}`,
		{
			method: 'POST',
			body: JSON.stringify(comment),
			headers: {
				'X-referer': top.location !== self.location ? document.referrer : self.location.origin,
				'Content-Type': 'application/json'
			}
		}
	);
	if (!res.ok) {
		throw new Error(`Comment post request failed with error ${res.status.toString()}`);
	}
	if (res.status === 201) {
		return await res.json();
	}
}
