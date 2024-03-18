export interface Config {
	endpoint?: string;
	id: number;
	page: string;
}
export type Comment = {
	id: number;
	upvotes: number;
	created: number;
	text: string;
	author: string;
	email?: string;
	notifications: boolean;
	replies: Comment[];
};
export const DEFAULT_ENDPOINT = 'https://convocomet.dev/api' as const;
