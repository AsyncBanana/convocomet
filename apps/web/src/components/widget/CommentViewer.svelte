<script lang="ts">
	import type { Comment as CommentType } from '@convocomet/sdk';
	import Comment from '../Comment.svelte';
	import type { SiteTableSelect } from '../../schemas/db/site';
	import type { UserTableSelect } from '../../schemas/db/auth';
	export let comments: CommentType[];
	export let config: import('@convocomet/sdk').Config;
	export let siteConfig: SiteTableSelect;
	export let session: UserTableSelect = undefined;
</script>

{#if comments.length === 0}
	<p>There are no comments here yet! Be the first to post one</p>
{:else}
	{#each comments as commentData (commentData.id)}
		<Comment
			author={commentData.author}
			upvotes={commentData.upvotes}
			created={commentData.created}
			id={commentData.id}
			replies={commentData.replies}
			{siteConfig}
			{session}
			type="viewing"
			{config}>{@html commentData.text}</Comment
		>
	{/each}
{/if}
