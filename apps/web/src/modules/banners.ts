import { writable } from 'svelte/store';
interface Banner {
	type: 'warning' | 'info' | 'success' | 'error';
	content: string;
}
const { subscribe, update } = writable<Map<symbol, Banner>>(new Map());
export default {
	subscribe: subscribe,
	update: update,
	add: (banner: Banner) => {
		const key = Symbol();
		if (import.meta.env.SSR) return key;
		update((banners) => banners.set(key, banner));
		return Symbol;
	},
	remove: (key: symbol) => {
		if (import.meta.env.SSR) return;
		update((banners) => {
			banners.delete(key);
			return banners;
		});
	}
};
