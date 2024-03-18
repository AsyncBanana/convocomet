<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import CommentInput from './widget/CommentInput.svelte';
	import Button from './Button.svelte';
	import { type Comment as CommentType, upvote } from '@convocomet/sdk';
	import CommentViewer from './widget/CommentViewer.svelte';
	import type { SiteTableSelect } from '../schemas/db/site';
	import type { UserTableSelect } from '../schemas/db/auth';
	export let type: 'moderation' | 'viewing';
	export let author: string;
	export let upvotes: number = 0;
	export let created: number;
	export let siteConfig: SiteTableSelect;
	export let session: UserTableSelect = undefined;
	// Config and id are only required for replies
	export let config: import('@convocomet/sdk').Config = { id: undefined, page: '' };
	export let id = undefined;
	export let replies: CommentType[] = [];
	let reply = false;
	let upvoted = import.meta.env.SSR ? true : localStorage.getItem(`${id}/upvote`) === '1';
	const dispatch = createEventDispatcher();
</script>

<div class="w-full">
	<span class="font-bold text-lg">{author}</span>

	<span class="text-gray text-sm ml-2">
		{new Date(created).toLocaleString(import.meta.env.SSR ? 'en-US' : navigator.language, {
			timeStyle: 'short',
			dateStyle: 'short'
		})}{#if type === 'moderation'}
			{' '}in {config.page}{/if}</span
	>
	<p class="prose"><slot /></p>
	<div class="flex flex-row gap-3">
		{#if type === 'moderation'}
			<Button
				icon="i-ic:baseline-check"
				type="tertiary"
				on:click={() => {
					dispatch('approve');
				}}
			/><Button
				icon="i-ic:round-close"
				type="tertiary"
				on:click={() => {
					dispatch('deny');
				}}
			/>
		{:else}
			<Button
				icon="i-ic:baseline-add-comment"
				type="tertiary"
				on:click={() => {
					reply = !reply;
				}}>Reply</Button
			>
			{#if siteConfig?.upvoteEnabled}
				<Button
					icon="i-material-symbols:keyboard-arrow-up-rounded"
					type="tertiary"
					size="square"
					on:click={async () => {
						try {
							upvoted = true;
							upvotes++;
							await upvote(id, config);
							localStorage.setItem(`${id}/upvote`, '1');
						} catch {
							// TODO Error message?
							upvotes--;
							upvoted = false;
						}
					}}
					disabled={upvoted}
				>
					{upvotes}
				</Button>
			{/if}
			{#if siteConfig.owner === session?.id}
				<Button
					icon="i-material-symbols:delete-outline-rounded"
					type="tertiary"
					size="square"
					on:click={() => {
						const dialog = document.getElementById('deletionDialog');
						dialog.setAttribute('data-comment', id);
						dialog.showModal();
					}}
				/>
			{/if}
		{/if}
	</div>
	<div class="mt-2 flex w-full mb-5">
		{#if reply || replies.length > 0}
			<div class="b-1 b-neutral-1" />
		{/if}
		<div class="ml-6 w-full">
			{#if reply}
				<CommentInput
					{config}
					sourceId={id}
					{siteConfig}
					{session}
					on:comment={(e) => {
						replies.unshift(e.detail);
						console.log(replies);
						replies = replies;
					}}
				/>
			{/if}
			{#if replies.length > 0}
				<CommentViewer comments={replies} {config} {siteConfig} {session} />
			{/if}
		</div>
	</div>
</div>
