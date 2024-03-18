<svelte:options accessors />

<script lang="ts">
	import type { UserTableSelect } from '../schemas/db/auth';
	import { slide } from 'svelte/transition';
	import Button from './Button.svelte';
	import UserInfo from './UserInfo.svelte';
	export let open = false;
	export let session: UserTableSelect = undefined;
</script>

{#if open}
	<div
		class="h-[calc(100vh-4rem)] w-full fixed top-18 overflow-hidden z-40 right-0 bg-base-3 p-3 flex flex-col gap-3"
		transition:slide={{ duration: 200 }}
	>
		{#if session}
			<div class=" rounded-md p-2 bg-base-2">
				<UserInfo user={session} />
			</div>
		{:else}
			<Button type="borderless" class="font-display text-xl" href="/signin" size="full"
				>Sign in</Button
			>
		{/if}
		<Button type="link" size="full" href="/about">About</Button>
		<Button type="link" size="full" href="/pricing">Pricing</Button>
	</div>
{/if}
