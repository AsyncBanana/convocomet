<script lang="ts">
	import banners from '../../../../modules/banners';
	import type { SiteTableSelect } from '../../../../schemas/db/site';
	import Button from '../../../Button.svelte';
	import Modal from '../../../Modal.svelte';
	import SiteConfigMenu from '../../../SiteConfigMenu.svelte';
	export let Site: SiteTableSelect;
	let dialog;
	async function updateConfig(e) {
		e.preventDefault();
		const form: HTMLFormElement = e.target;
		const res = await fetch(`/api/sites/${Site.id}`, {
			// @ts-expect-error FormData types seem wrong?
			body: new URLSearchParams(new FormData(form)).toString(),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			method: 'POST'
		});
		if (!res.ok) {
			banners.add({ content: `Error updating configuration: ${await res.text()}`, type: 'error' });
		} else {
			banners.add({ content: 'Configuration successfully updated!', type: 'info' });
		}
	}
</script>

<SiteConfigMenu mode="configure" site={Site} on:submit={updateConfig}>
	<Button
		type="tertiary"
		icon="i-material-symbols:delete-outline-rounded"
		class="mt-2"
		action="button"
		on:click={() => dialog.showModal()}>Delete Site</Button
	>
</SiteConfigMenu>
<Modal bind:this={dialog}>
	<svelte:fragment slot="header">Site Deletion</svelte:fragment>
	<div class="mb-6 text-lg">
		Are you sure you want to delete this site? All comments will be deleted as well
	</div>
	<svelte:fragment slot="action"
		><Button
			on:click={async (e) => {
				e.preventDefault();
				dialog.close('deleted site');
				const res = await fetch(`/api/sites/${Site.id}`, {
					method: 'DELETE'
				});
				if (!res.ok) {
					banners.add({
						content: `Site Removal Failed with error ${res.status}: ${await res.text()}`,
						type: 'error'
					});
				} else {
					window.location.href = '/dashboard';
				}
			}}
			class="bg-red-500 hover:bg-red-700">Delete</Button
		>
		<Button type="borderless">Cancel</Button></svelte:fragment
	>
</Modal>
