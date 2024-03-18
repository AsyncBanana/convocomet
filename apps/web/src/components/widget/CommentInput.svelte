<script lang="ts">
	import { type ComponentProps, createEventDispatcher } from 'svelte';
	import { postComment } from '@convocomet/sdk';
	import TextArea from '../TextArea.svelte';
	import Button from '../Button.svelte';
	import TextInput from '../TextInput.svelte';
	import Checkbox from '../Checkbox.svelte';
	import Banner from '../Banner.svelte';
	import type { UserTableSelect } from '../../schemas/db/auth';
	import type { SiteTableSelect } from '../../schemas/db/site';
	import signIn from '../../modules/authClient';
	import Modal from '../Modal.svelte';
	import TabGroup from '../TabGroup.svelte';
	import liveSignIn from '../../modules/authClient';
	export let config: import('@convocomet/sdk').Config;
	export let sourceId: number = undefined;
	export let session: UserTableSelect = undefined;
	export let siteConfig: SiteTableSelect;
	const localPath = `${config.id}/${config.page}${sourceId ? `/${sourceId}/` : ''}/text`;
	let email = session?.email || '';
	let author = session?.name || '';
	let text = (import.meta.env.SSR && localStorage.getItem(localPath)) || '';
	let notifications = false;
	let dialog: Modal;
	let dialogMode: 'signin' | 'signup' = 'signin';
	let banner: { type: ComponentProps<Banner>['type']; content: string };
	$: if (import.meta.env.SSR) localStorage.setItem(localPath, text);
	const dispatch = createEventDispatcher();
</script>

<form
	on:submit={async (e) => {
		e.preventDefault();
		if (notifications && !session) {
			// TODO Replace with Constraint Validation API?
			banner = {
				type: 'warning',
				content: 'Please sign in if you wish to enable notifications'
			};
			return;
		}
		if (siteConfig.requireSignIn && !session) {
			banner = {
				type: 'warning',
				content: 'Please sign in to comment'
			};
			return;
		}
		try {
			const comment = await postComment({ author, text, notifications, sourceId }, config);
			banner = {
				type: 'info',
				content: comment ? 'Comment posted!' : 'Comment awaiting moderation'
			};
			text = '';
			if (comment) {
				dispatch('comment', comment);
			}
		} catch {
			banner = { type: 'error', content: 'Error posting comment' };
		}
	}}
	class="flex flex-col md:block"
>
	<TextArea
		markdown
		placeholder="Type your comment here"
		required
		bind:value={text}
		rows={5}
		minlength={4}
		id="CommentInput"
		maxlength={4092}>Comment Text</TextArea
	>
	{#if session}
		<span class="text-gray-500 text-sm ml-3 mb-6">Signed in as {session.name ?? session.email}</span
		>
		<Button
			type="borderless"
			class="text-sm text-gray-500 mb-3"
			action="button"
			on:click={async () => {
				await fetch('/api/auth/signout', { method: 'POST' });
				session = undefined;
				author = '';
				email = '';
			}}>Sign out</Button
		>
		<Checkbox
			bind:checked={notifications}
			name="notification"
			description="This will be sent through email">Send notifications for new replies</Checkbox
		>
	{:else}<div>
			<Button type="borderless" on:click={() => dialog.showModal()}>Sign In With Email</Button>

			<span class="text-neutral-4 text-sm ml-3 mb-6">Sign in with connected accounts</span>
			<div class="flex flex-row gap-2 mb-3">
				<Button
					type="secondary"
					action="button"
					icon="i-mdi:google"
					ariaLabel="Sign in with Google"
					on:click={() =>
						signIn('google', (user) => {
							session = user;
						})}
				></Button>
				<Button
					type="secondary"
					action="button"
					icon="i-mdi:github"
					ariaLabel="Sign in with GitHub"
					on:click={() =>
						signIn('github', (user) => {
							session = user;
						})}
				></Button>
			</div>
		</div>
		{#if !siteConfig.requireSignIn}
			<div class="flex flex-row place-items-center gap-3">
				<span class="h-[0.5px] grow bg-neutral-2" />
				<span class="text-neutral-4 font-semibold">Or Comment anonymously</span>
				<span class="h-[0.5px] grow bg-neutral-2" />
			</div>
			<TextInput
				description="Displayed in your suggestions"
				required
				bind:value={author}
				readonly={!!session?.name}>Author Name</TextInput
			>{/if}{/if}
	<Button>Post</Button>
</form>
{#if banner}
	<Banner type={banner.type} on:exit={() => (banner = undefined)} floating={false} class="my-2"
		>{banner.content}</Banner
	>
{/if}
<Modal bind:this={dialog}>
	<span slot="header">{dialogMode === 'signin' ? 'Sign In' : 'Sign Up'}</span>
	<TabGroup>
		<Button
			type={dialogMode === 'signin' ? 'primary' : 'tertiary'}
			disabled={dialogMode === 'signin'}
			on:click={() => (dialogMode = 'signin')}
			size="full">Sign In</Button
		>
		<Button
			type={dialogMode === 'signup' ? 'primary' : 'tertiary'}
			disabled={dialogMode === 'signup'}
			on:click={() => (dialogMode = 'signup')}
			size="full">Sign Up</Button
		>
	</TabGroup>
	{#if dialogMode === 'signin'}
		<form
			on:submit|preventDefault={async () => {
				liveSignIn('email', (user) => (session = user), {
					email,
					type: 'signin'
				});
			}}
		>
			<TextInput
				description="Used for verification and optional notifications"
				placeholder="coolperson@example.com"
				type="email"
				bind:value={email}>Email</TextInput
			>
			<Button action="submit" type="primary">Sign In</Button>
		</form>
	{:else}
		<form
			on:submit|preventDefault={async () => {
				liveSignIn('email', (user) => (session = user), {
					email,
					name: author,
					type: 'signup'
				});
			}}
		>
			<TextInput
				description="Used for verification and optional notifications"
				placeholder="coolperson@example.com"
				type="email"
				bind:value={email}>Email</TextInput
			>
			<TextInput description="Displayed in your suggestions" type="text" bind:value={author}
				>Nickname</TextInput
			>
			<Button action="submit" type="primary">Sign Up</Button>
		</form>
	{/if}
</Modal>
