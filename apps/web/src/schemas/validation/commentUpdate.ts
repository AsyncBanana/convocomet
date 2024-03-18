import { literal, object } from 'superstruct';

export const CommentUpdateSchema = object({
	type: literal('upvote')
});
