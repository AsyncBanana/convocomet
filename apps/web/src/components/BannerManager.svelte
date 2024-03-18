<script>
	import Banner from './Banner.svelte';
	import banners from '../modules/banners';
</script>

{#each $banners as [key, banner] (key)}
	<Banner
		type={banner.type}
		on:exit={() => {
			banners.remove(key);
		}}>{banner.content}</Banner
	>
{/each}
