<script lang="ts">
	import type { SiteTableSelect } from '../schemas/db/site';
	import TextInput from './TextInput.svelte';
	import Button from './Button.svelte';
	import Checkbox from './Checkbox.svelte';
	export let mode: 'create' | 'configure' = 'configure';
	export let site: SiteTableSelect | undefined = undefined;
	export { className as class };
	let className = undefined;
	let domains = site?.domainAllowList || [''];
</script>

<form
	action={mode === 'create' ? '/api/sites' : `/api/sites/${site.id}`}
	method="post"
	class={className}
	on:submit
>
	<h1 class="text-2xl font-display font-bold">New Site</h1>
	<div class="md:mx-3">
		<TextInput
			placeholder="TheBestWebsite"
			description="Normally the name of your website (only alphanumeric, dashes, and underscores)"
			required
			maxlength={100}
			minlength={3}
			pattern={'[a-zA-Z0-9_-]+'}
			name="name"
			value={site?.name}
			title="Only alphanumeric, dashes, and underscores">Site Name</TextInput
		>
	</div>
	<h2 class="text-xl font-display font-bold">Features</h2>
	<div class="md:mx-3">
		<Checkbox
			name="upvoteEnabled"
			description="Allow upvoting comments"
			checked={site?.upvoteEnabled != null ? true : undefined}>Upvotes</Checkbox
		>
	</div>
	<h2 class="text-xl font-display font-bold">Moderation</h2>
	<div class="mx-3">
		<Checkbox
			name="manualModeration"
			description="Manually approve comments before they show up"
			checked={site?.manualModeration != null ? true : site?.manualModeration}
			>Manual Moderation Layer</Checkbox
		>
		<Checkbox name="spamFilter" description="Filter spam comments" checked={!!site?.spamFilter}
			>Spam Filter</Checkbox
		>
	</div>
	<h2 class="text-xl font-display font-bold">Security</h2>
	<div class="md:mx-3 mb-4">
		<Checkbox
			name="requireSignIn"
			description="Require commenters to sign in"
			checked={!!site?.requireSignIn}>Require Sign In</Checkbox
		>
		<label class="flex flex-col md:my-3" for="domainAllowSelector">
			<div class="ml-2 text-lg font-500">Allowed Domains</div>
			<p class="text-gray-500 text-sm ml-2">
				Domains to allow commented submissions from. Leave blank to allow all domains
			</p>
		</label>

		{#each domains as domain, i}
			<div class="flex flex-row b-1 b-neutral-1 rounded-md md:my-3 shadow-md scroll-x-auto">
				<TextInput
					placeholder="https://example.com"
					maxlength={100}
					type="url"
					name="domainAllowList"
					class="rounded-r-none border-0"
					containerClass="grow-2 h-full !my-0"
					id="domainAllowSelector"
					value={domain}
					shadow={false}
					on:input={(e) => {
						// @ts-expect-error Need more specific typings
						domains[i] = e.target.value;
					}}
					title="Use full URLs, including HTTP or HTTPS"
				></TextInput>
				<Button
					type="tertiary"
					action="button"
					icon="i-material-symbols:delete-outline-rounded"
					class="text-red border-0 b-l-1 rounded-l-none"
					ariaLabel="remove domain"
					on:click={() => {
						domains.splice(i, 1);
						domains = domains;
					}}
				></Button>
			</div>
		{/each}

		<Button
			type="secondary"
			action="button"
			icon="i-icon-park-outline:add-web"
			ariaLabel="Add domain"
			on:click={() => {
				domains.push('');
				domains = domains;
			}}
		></Button>
	</div>
	<Button>{mode === 'create' ? 'Create Site' : 'Apply changes'}</Button>
	<slot />
</form>
