<script lang="ts">
	import { onMount } from 'svelte';

	let iframe: HTMLIFrameElement;
	export let page: string;
	export let site: string;
	export let host: string = 'https://convocomet.dev/widget';
	export let theme: 'light' | 'auto' | 'dark' = undefined;
	onMount(() => {
		window.addEventListener('message', (e) => {
			if (e.data.type === 'resize') {
				iframe.height = e.data.height;
			}
		});
		iframe.contentWindow.postMessage(
			{
				type: 'resizerInit'
			},
			'*'
		);
	});
	const params = new URLSearchParams({
		site,
		page,
		theme
	});
</script>

<iframe
	bind:this={iframe}
	loading="lazy"
	style="width:100%;border:0;"
	title={'Comments by ConvoComet'}
	allowtransparency={true}
	src={`${host}?${params.toString()}`}
/>
