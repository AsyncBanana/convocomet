<script lang="ts">
	import type { SiteTableSelect } from '../../schemas/db/site';
	import type { AggregatedResult } from '../../modules/analytics';
	import Button from '../Button.svelte';
	let main;
	export let sites: SiteTableSelect[] = [];
	export let views: AggregatedResult;
	export let comments: AggregatedResult;
</script>

<div class="w-main" bind:this={main}>
	<div class="flex place-content-between items-center flex-col sm:flex-row">
		<h1 class="text-2xl font-700 font-display w-min">Sites</h1>
		<Button href="/dashboard/create" type="primary" class="" icon="i-octicon:plus-16"
			>Create New Site</Button
		>
	</div>
	<hr class="bg-primary-ultralight h-0.5 w-full mt-1" />
	{#if sites.length > 0}
		<ol class="list-decoration-none">
			{#each sites as site}
				<li class="b-b-1 b-neutral-1 p-3">
					<a href={'/dashboard/sites/' + site.id} class="hover:underline">
						<div class="text-lg font-bold dark:text-blue-500 text-blue-700 py-3">
							{site.name}
						</div>
					</a>
					<div class="text-sm flex items-center gap-1 text-neutral-4">
						<span class="i-ic:baseline-remove-red-eye" />{views[site.id] || 0}
						<span class="i-ic:baseline-comment" />{comments[site.id] || 0}
					</div>
				</li>
				<!-- <Card header={site.id} href={'/dashboard/sites/' + site.id} /> -->
			{/each}
		</ol>
	{:else}
		<h2 class="text-center">
			It looks like you don't have any sites created. Create one using the + icon above
		</h2>
		<div class="i-radix-icons:rocket h-50 w-full" />
	{/if}
</div>
