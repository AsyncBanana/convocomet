<script lang="ts">
	import Card from './Card.svelte';
	import type { Subscription } from '@lemonsqueezy/lemonsqueezy.js';
	import type { UserTableSelect } from '../schemas/db/auth';
	import Button from './Button.svelte';
	import Banner from './Banner.svelte';
	export let userData: UserTableSelect;
	export let pro: Subscription = undefined;
	const hasPro = pro && pro.data.attributes.status === 'active';
	const scheduledCancel = hasPro && !!pro.data.attributes.ends_at;
	let notifClosed = false;
</script>

{#if scheduledCancel && !notifClosed}
	<Banner floating={false} type="info" class="m-3 !w-full" on:exit={() => (notifClosed = true)}
		>Subscription cancellation scheduled for {new Date(
			pro.data.attributes.ends_at
		).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		})}</Banner
	>
{/if}
<div class="text-lg font-500">Current plan</div>
<div class="flex items-center gap-3">
	<Button disabled={true} type="tertiary">{hasPro ? 'Pro' : 'Hobby'}</Button>
	{#if hasPro}
		<Button
			type={scheduledCancel ? 'tertiary' : 'primary'}
			href={scheduledCancel ? undefined : '/api/payment/cancel'}
			disabled={scheduledCancel}
		>
			{scheduledCancel ? 'Cancellation Scheduled' : 'Downgrade to Hobby & Cancel Subscription'}
		</Button>
		<Button type="secondary" href={pro.data.attributes.urls.update_payment_method}
			>Manage Billing</Button
		>
	{:else}
		<Button
			type={'primary'}
			disabled={hasPro && !scheduledCancel}
			href={`${
				import.meta.env.PUBLIC_LEMONSQUEEZY_CHECKOUT_URL
			}?checkout[email]=${encodeURIComponent(
				userData.email
			)}&checkout[custom][userID]=${encodeURIComponent(userData.id)}`}
		>
			{hasPro && !scheduledCancel ? 'Current plan' : 'Upgrade to pro'}
		</Button>
	{/if}
</div>
<p class="text-sm opacity-75">
	Learn more about each option on the <a href="/pricing" class="underline">Pricing</a> page
</p>
