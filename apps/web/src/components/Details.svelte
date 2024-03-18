<script lang="ts">
	export let summary: string;
</script>

<details class="p-5 b-1 rounded-lg b-neutral-1 cursor-pointer">
	<summary class="text-lg">{summary}</summary>
	<p class="m-3"><slot /></p>
</details>
