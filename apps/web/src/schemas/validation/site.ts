import {
	object,
	string,
	boolean,
	size,
	optional,
	array,
	define,
	union,
	empty,
	type Infer
} from 'superstruct';
const url = define<string>('URL', (str) => {
	try {
		new URL(str as string);
	} catch {
		return false;
	}
	return true;
});
export const SiteSchema = object({
	name: size(string(), 3, 100),
	manualModeration: optional(boolean()),
	spamFilter: optional(boolean()),
	upvoteEnabled: optional(boolean()),
	requireSignIn: optional(boolean()),
	domainAllowList: optional(array(union([url, empty(string())])))
});

export type SiteSchemaType = Infer<typeof SiteSchema>;
