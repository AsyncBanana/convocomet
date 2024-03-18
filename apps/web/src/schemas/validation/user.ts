import { object, pattern, string, union, size, enums, type Infer, literal } from 'superstruct';
const email = pattern(
	size(string(), 1, 320),
	/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
);
const username = pattern(size(string(), 1, 64), /^[\w- ]+$/);
export const SignInEmailSchema = object({
	email: email
});
export const SignUpEmailSchema = object({
	email: email,
	name: username
});
export type SignInEmailSchemaType = Infer<typeof SignInEmailSchema>;
