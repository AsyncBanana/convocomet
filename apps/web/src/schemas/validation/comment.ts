import {
	string,
	define,
	refine,
	Struct,
	object,
	size,
	optional,
	nullable,
	boolean,
	type Infer,
	number
} from 'superstruct';
function byteSize<T extends string, S>(
	struct: Struct<T, S>,
	min: number,
	max: number = min
): Struct<T, S> {
	return refine(struct, 'size', (value) => {
		const bytes = new Blob([value]).size;
		return min < bytes && max > bytes;
	});
}
export const CommentSchema = object({
	text: byteSize(string(), 1, 4096),
	author: size(string(), 0, 100), // if size is 0 authorId must be passed
	notifications: boolean(),
	sourceId: optional(number())
});
export type Comment = Infer<typeof CommentSchema>;
