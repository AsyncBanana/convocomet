<script lang="ts">
	import { onMount } from 'svelte';
	import type { SiteTableSelect } from '../schemas/db/site';
	import Button from './Button.svelte';
	import Modal from './Modal.svelte';
	import Code from './Code.svelte';
	export let site: SiteTableSelect;
	let dialog: Modal;
	onMount(() => {
		if (!import.meta.env.SSR) {
			dialog.showModal();
		}
	});
	let selected = 'HTML';
</script>

<Modal bind:this={dialog}>
	<svelte:fragment slot="header">Installation Instructions</svelte:fragment>
	<svelte:fragment slot="subheader"
		>Your site has been created! Follow the instructions below to add it to your website</svelte:fragment
	>
	<div>
		<div class="flex flex-row gap-2 place-content-center">
			<Button
				icon="i-vscode-icons:file-type-html"
				type="tertiary"
				disabled={selected === 'HTML'}
				on:click={() => (selected = 'HTML')}>HTML</Button
			>
			<Button
				icon="i-vscode-icons:file-type-reactjs"
				type="tertiary"
				disabled={selected === 'React'}
				on:click={() => (selected = 'React')}>React</Button
			><Button
				icon="i-vscode-icons:file-type-svelte"
				type="tertiary"
				disabled={selected === 'Svelte'}
				on:click={() => (selected = 'Svelte')}>Svelte</Button
			>
			<Button
				icon="i-vscode-icons:file-type-vue"
				type="tertiary"
				disabled={selected === 'Vue'}
				on:click={() => (selected = 'Vue')}>Vue</Button
			>
		</div>
		<div class="prose">
			{#if selected === 'HTML'}
				Copy the following snippet into pages where you want commenting, or in a shared file. Put it
				where you want your comment section to appear
				<Code
					lang="HTML"
					src={/* script tag insertion is to fix some weird LSP bug */ `<div id="convocomet-widget" data-site="${site.id}" data-page="[PAGE_SLUG_OR_ID]"></div>
<${'script'} src="https://convocomet.dev/widget.js" async></${'script'}>`}
				/>
			{/if}
			{#if selected === 'React'}
				Install the following npm package into your site by running the following command
				<Code src="npm install @convocomet/react" />
				Then, import the widget in a layout file and insert it where you want the component to be
				<Code
					lang="JS"
					src={`// at the top of the file
import CommentWidget from "@convocomet/react"
...
// where you want the comments to show up
<CommentWidget id="${site.id}" page="[PAGE_SLUG_OR_ID]">Test</CommentWidget>`}
				/>
			{/if}
			{#if selected === 'Svelte'}
				Install the following npm package into your site by running the following command
				<Code src="npm install @convocomet/svelte" />
				Then, import the widget in a layout file and insert it where you want the component to be
				<Code
					lang="JS"
					src={`// at the top of the file
import CommentWidget from "@convocomet/svelte"
...
// where you want the comments to show up
<CommentWidget id="${site.id}" page="[PAGE_SLUG_OR_ID]">Test</CommentWidget>`}
				/>
			{/if}
			{#if selected === 'Vue'}
				Install the following npm package into your site by running the following command
				<Code src="npm install @convocomet/vue" />
				Then, import the widget in a layout file and insert it where you want the component to be
				<Code
					lang="JS"
					src={`// at the top of the file
import CommentWidget from "@convocomet/vue"
...
// where you want the comments to show up
<CommentWidget id="${site.id}" page="[PAGE_SLUG_OR_ID]">Test</CommentWidget>`}
				/>
			{/if}
			For more information on how to set up and use the widget, check out the
			<a href="https://docs.convocomet.dev">Docs</a>
		</div>
	</div>
</Modal>
