<script lang="ts">
	import banners from '../../../modules/banners';
	import type { CommentTableSelect } from '../../../schemas/db/comment';
	import type { SiteTableSelect } from '../../../schemas/db/site';
	import uplot from 'uplot';
	import Comment from '../../Comment.svelte';
	import type { AnalyticsResult } from '../../../modules/analytics';
	import { onMount } from 'svelte';
	export let Comments: CommentTableSelect[] = [];
	export let Site: SiteTableSelect;
	export let ViewEvents: AnalyticsResult;
	export let data: [number[], number[]] = [[], []];
	if (Site.id in ViewEvents) {
		for (const viewEvent of ViewEvents[Site.id]) {
			data[0].push(viewEvent[0]);
			data[1].push(viewEvent[1]);
		}
	}
	let graphContainer: HTMLDivElement;
	onMount(() => {
		const style = getComputedStyle(document.body);
		const viewPlot = new uplot(
			{
				title: 'Views in the past 30 days',
				width: graphContainer.clientWidth,
				height: 400,
				cursor: {
					dataIdx: (self, seriesIdx, hoveredIdx, cursorXVal) => {
						let xValues = self.data[0];
						let yValues = self.data[seriesIdx];

						// todo: only scan in-view idices

						if (yValues[hoveredIdx] == null) {
							let nonNullLft = null,
								nonNullRgt = null,
								i;

							i = hoveredIdx;
							while (nonNullLft == null && i-- > 0) {
								if (yValues[i] != null) nonNullLft = i;
							}

							i = hoveredIdx;
							while (nonNullRgt == null && i++ < yValues.length) {
								if (yValues[i] != null) nonNullRgt = i;
							}

							let rgtVal = nonNullRgt == null ? Infinity : xValues[nonNullRgt];
							let lftVal = nonNullLft == null ? -Infinity : xValues[nonNullLft];

							let lftDelta = cursorXVal - lftVal;
							let rgtDelta = rgtVal - cursorXVal;

							hoveredIdx = lftDelta <= rgtDelta ? nonNullLft : nonNullRgt;
						}

						return hoveredIdx;
					},
					x: false,
					y: false
				},
				series: [
					{
						sorted: 1, // Ascending
						value: '{MM}/{DD}/{YYYY}',
						label: 'Date'
					},
					{
						// initial toggled state (optional)
						show: true,

						spanGaps: true,

						// in-legend display
						label: 'Views',

						// series style
						stroke: 'hsl(193, 99%, 50%)',
						width: 2,
						fill: `hsl(${style.getPropertyValue('--upt-colors-neutral-2')})`,
						dash: [10, 0]
					}
				],
				axes: [
					{
						stroke: `hsl(${style.getPropertyValue('--upt-colors-neutral-4')}`,
						grid: {
							show: false
						}
					},
					{
						stroke: `hsl(${style.getPropertyValue('--upt-colors-neutral-4')}`,
						grid: {
							show: true,
							stroke: `hsl(${style.getPropertyValue('--upt-colors-neutral-2')}`,
							width: 1,
							dash: []
						}
					}
				],
				scales: {
					x: {
						auto: false,
						range: [Date.now() / 1000 - 2592000, Date.now() / 1000]
					}
				}
			},
			data,
			graphContainer
		);
		let wait = false;
		new ResizeObserver(() => {
			if (!wait) {
				requestAnimationFrame(() => {
					viewPlot.setSize({ width: graphContainer.clientWidth, height: 400 });
				});
				wait = true;
				setTimeout(() => {
					wait = false;
				}, 50);
			}
		}).observe(graphContainer, {});
	});
</script>

<div class="grid md:grid-cols-2">
	<div>
		<h2 class="text-xl">Comment Queue</h2>
		{#if Comments.length > 0}
			<div class="flex gap-3 flex-col">
				{#each Comments as CommentData (CommentData.id)}
					<Comment
						siteConfig={Site}
						author={CommentData.author}
						type="moderation"
						created={CommentData.created}
						config={{
							id: Site.id,
							page: CommentData.pageId
						}}
						on:approve={async () => {
							Comments.splice(
								Comments.findIndex((c) => (c.id = CommentData.id)),
								1
							);
							Comments = Comments;
							try {
								await fetch(
									`/api/comment/${Site.id}/approve?comment=${encodeURIComponent(CommentData.id)}`
								);
							} catch {
								banners.add({ type: 'error', content: 'Error approving comment' });
							}
						}}
						on:deny={async () => {
							Comments.splice(Comments.findIndex((c) => (c.id = CommentData.id)) - 1, 1);
							Comments = Comments;
							try {
								await fetch(
									`/api/comment/${Site.id}/deny?comment=${encodeURIComponent(CommentData.id)}`
								);
							} catch {
								banners.add({ type: 'error', content: 'Error rejecting comment' });
							}
						}}>{@html CommentData.text}</Comment
					>
				{/each}
			</div>
		{:else}
			<h3>It doesn't look like there are any comments awaiting moderation</h3>
		{/if}
	</div>
	<div bind:this={graphContainer} class="bg-base-3" style="min-height:400px;"></div>
</div>
