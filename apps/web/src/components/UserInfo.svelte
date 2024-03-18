<script lang="ts">
	import type { UserTableSelect } from '../schemas/db/auth';
	import Button from './Button.svelte';
	export let user: UserTableSelect;
</script>

<div class="flex flex-row gap-3 mb-3">
	<!-- svelte-ignore a11y-img-redundant-alt -->
	<img
		class="aspect-square h-15 rounded-full"
		alt="user profile picture"
		src={user.image || '/images/profile.svg'}
	/>
	<div class="flex flex-col">
		<span class="text-lg font-bold">{user.name}</span>
		<span class="text-gray-500">{user.email}</span>
	</div>
</div>
<Button type="borderless" icon="i-radix-icons:dashboard" size="full" href="/dashboard">
	Dashboard
</Button>
<Button
	type="borderless"
	icon="i-material-symbols:settings-outline-rounded"
	size="full"
	href="/dashboard/settings"
>
	Settings
</Button>
<Button type="borderless" icon="i-ic-baseline:log-out" size="full" href="/api/auth/signout">
	Sign out
</Button>
