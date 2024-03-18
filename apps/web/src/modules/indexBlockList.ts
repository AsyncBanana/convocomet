/**
 * List of pages to be blocked, formatted in a way conformant to robots.txt allow/disallow URL rules.
 */
export const indexBlockList = [
	'/api/',
	'/dashboard/',
	'/dashboard',
	'/widget',
	'/liveauthcallback',
	'/checkemail'
];
/**
 * Check if a given URL matches a block in the block list
 */
export function matchBlock(url: string | URL) {
	const path = (url instanceof URL ? url : new URL(url)).pathname;
	return indexBlockList.some(
		(block) => block === path || (block.endsWith('/') && path.startsWith(block)) // TODO: use an actual robots.txt-format parser
	);
}
