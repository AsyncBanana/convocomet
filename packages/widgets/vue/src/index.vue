<script setup lang="ts">
import {onMounted, ref} from "vue"
const iframe = ref<HTMLIFrameElement | null>(null);
const props = withDefaults(defineProps<{
    site: string;
    page: string;
    theme?: 'light' | 'dark' | 'auto';
    host?: string
}>(),{
	host: "https://convocomet.dev/widget"
})
onMounted(() => {
	if (!iframe) return new Error("No iframe found")
    window.addEventListener('message', (e) => {
			if (e.data.type === 'resize') {
				// @ts-expect-error
				iframe.value.height = e.data.height;
			}
		});
		// @ts-expect-error
		iframe.value.contentWindow.postMessage(
			{
				type: 'resizerInit'
			},
			'*'
		);
})
const searchparams = new URLSearchParams({
	site: props.site,
	page: props.page
})
if (props.theme) searchparams.append("theme",props.theme)
</script>
<template>
<iframe
			ref="iframe"
			loading="lazy"
			:style="{
				width: '100%',
				border: '0'
			}"
			title="Comments by ConvoComet"
			:src="`${props.host}?${searchparams.toString()}`"
		/>
</template>
