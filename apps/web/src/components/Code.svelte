<script lang="ts">
	import Prism from 'prismjs';
	import Button from './Button.svelte';
	import banners from '../modules/banners';
	export let lang: string = undefined;
	export let src: string;
</script>

<pre class="flex flex-row scroll-x-auto items-center p-3 rounded-md b-1 b-neutral-1">{#if lang}<code
			class="language-{lang.toLowerCase()}"
			>{@html Prism.highlight(src, Prism.languages[lang.toLowerCase()], lang)}</code
		>{:else}<code>{src}</code>{/if}<Button
		class="ml-auto self-start"
		type="tertiary"
		icon="i-material-symbols:content-copy-outline"
		on:click={async () => {
			try {
				await navigator.clipboard.writeText(src);
				banners.add({ type: 'info', content: 'Code copied!' });
			} catch {
				banners.add({ type: 'error', content: 'Error copying code' });
			}
		}}
	/></pre>
