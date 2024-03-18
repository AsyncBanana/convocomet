import { build } from 'esbuild';
import vue from 'esbuild-plugin-vue3';
await build({
	entryPoints: ['src/index.vue'],
	bundle: true,
	format: 'esm',
	outdir: 'dist',
	plugins: [vue()],
	external: ['vue']
});
