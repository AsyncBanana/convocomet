<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { onMount } from 'svelte';
	import { type Comment, loadComments } from '@convocomet/sdk';
	import CommentViewer from './CommentViewer.svelte';
	import CommentInput from './CommentInput.svelte';
	import Button from '../Button.svelte';
	import Banner from '../Banner.svelte';
	import Select from '../Select.svelte';
	import type { UserTableSelect } from '../../schemas/db/auth';
	import type { SiteTableSelect } from '../../schemas/db/site';
	export let session: UserTableSelect = undefined;
	export let siteConfig: SiteTableSelect;
	let comments: { continuation?: string; comments: Comment[] };
	let banner: { type: ComponentProps<Banner>['type']; content: string };
	let order: 'newest' | 'oldest' | 'top' = 'newest';
	const queryParams = !import.meta.env.SSR
		? new URLSearchParams(window.location.search)
		: undefined;
	const config = queryParams
		? {
				page: queryParams.get('page'),
				id: +queryParams.get('site'),
				endpoint: '/api'
			}
		: {
				page: '',
				id: 0,
				endpoint: '/api'
			};
	onMount(async () => {
		import('prismjs');
	});
	$: {
		loadComments(config, order)
			.then((newComments) => (comments = newComments))
			.catch(() => (banner = { type: 'error', content: 'Error retrieving comments from server' }));
	}
</script>

<div class="px-4 box-border flex flex-col">
	<CommentInput
		{config}
		{session}
		{siteConfig}
		on:comment={(e) => {
			comments.comments.unshift(e.detail);
			comments = comments;
		}}
	/>
	<label for="order-select" class="mt-2 text-gray-500">Order comments by</label>
	<Select
		name="order"
		id="order-select"
		options={[
			['Newest First', 'newest'],
			['Oldest first', 'oldest'],
			['Most upvoted first', 'top']
		]}
		bind:value={order}
	></Select>
	{#if comments}
		<CommentViewer comments={comments.comments} {config} {siteConfig} {session} />
	{/if}
	{#if banner}
		<Banner type={banner.type} on:exit={() => (banner = undefined)} floating={false} class="my-2"
			>{banner.content}</Banner
		>
	{/if}
	{#if comments?.continuation}
		<Button
			on:click={async () => {
				const res = await loadComments(config, order, comments.continuation);
				comments.comments = comments.comments.concat(res.comments);
				comments.continuation = res.continuation;
			}}>Load more comments</Button
		>
	{/if}
	<p class="opacity-80">
		Powered by <a href="https://convocomet.dev" class="underline font-bold" target="_blank"
			>ConvoComet</a
		>
	</p>
</div>
