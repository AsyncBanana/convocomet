<script lang="ts">
	import Avatar from './Avatar.svelte';
	import Dropdown from './Dropdown.svelte';
	import type { UserTableSelect } from '../schemas/db/auth';
	import UserInfo from './UserInfo.svelte';
	export let user: UserTableSelect;
</script>

<div class="h-3/4 ml-3 font-display lt-md:hidden">
	<Avatar
		class="aspect-square h-full"
		ariaDescribedby="userDropdown"
		src={user.image || '/images/profile.svg'}
		id="userAvatar"
	></Avatar>
	<Dropdown id="userAvatar">
		<UserInfo {user} />
	</Dropdown>
</div>
