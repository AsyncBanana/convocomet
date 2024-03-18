<script lang="ts">
	import Button from './Button.svelte';
	import TextInput from './TextInput.svelte';
	import TabGroup from './TabGroup.svelte';
	import Banner from './Banner.svelte';
	let email = '';
	let page: 'signin' | 'signup' = 'signin';
	let emailPending = false;
	let notification;
	export let redirect = undefined;
</script>

<h1 class="text-2xl text-center font-700 font-display mb-6">
	{page === 'signin' ? 'Sign In' : 'Sign Up'}
</h1>
{#if notification}
	<Banner class="!w-full" type="error" on:exit={() => (notification = '')}>{notification}</Banner>
{/if}
<div class="flex items-center flex-col gap-3">
	<TabGroup>
		<Button
			type={page === 'signin' ? 'primary' : 'borderless'}
			size="full"
			disabled={page === 'signin'}
			on:click={() => (page = 'signin')}>Sign In</Button
		>
		<Button
			type={page === 'signup' ? 'primary' : 'borderless'}
			size="full"
			disabled={page === 'signup'}
			on:click={() => (page = 'signup')}>Sign Up</Button
		>
	</TabGroup>
	{#if page === 'signin'}
		<form
			action="/api/auth/signin/email"
			method="post"
			class="w-full"
			on:submit|preventDefault|stopPropagation={async (e) => {
				emailPending = true;
				const res = await fetch(
					`/api/auth/signin/email${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`,
					{
						// @ts-ignore
						body: new URLSearchParams(new FormData(e.currentTarget)).toString(),
						method: 'POST',
						redirect: 'manual',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded'
						}
					}
				);
				if (res.status === 400) {
					const error = await res.text();
					if (error === 'Please create an account') {
						page = 'signup';
					}
					notification = error;
					emailPending = false;
					return;
				}
				window.location.href = '/checkemail';
			}}
		>
			<TextInput
				containerClass="w-full mb-3"
				type="email"
				bind:value={email}
				name="email"
				required
				maxlength={320}
				description="A verification email will be sent to this email">Email</TextInput
			>
			<Button
				size="full"
				type="tertiary"
				action="submit"
				loading={emailPending}
				disabled={emailPending}>Sign in with Email</Button
			>
		</form>
	{:else}
		<form
			method="post"
			action={`/api/auth/signup/email${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
			class="w-full"
			on:submit={() => (emailPending = true)}
		>
			<TextInput
				containerClass="w-full"
				type="text"
				name="name"
				required
				maxlength={64}
				description="This will be used as a display name">Name</TextInput
			>
			<TextInput
				containerClass="w-full mb-3"
				type="email"
				bind:value={email}
				name="email"
				required
				maxlength={320}
				description="A verification email will be sent to this email">Email</TextInput
			>
			<Button
				size="full"
				type="tertiary"
				action="submit"
				loading={emailPending}
				disabled={emailPending}>Sign in with Email</Button
			>
		</form>
	{/if}
	<Button
		href={`/api/auth/signin/google${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
		type="tertiary"
		icon="i-logos:google-icon"
		size="full">Sign in with Google</Button
	>
	<Button
		href={`/api/auth/signin/github${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
		type="tertiary"
		icon="i-logos:github-icon"
		size="full">Sign in with GitHub</Button
	>
</div>
