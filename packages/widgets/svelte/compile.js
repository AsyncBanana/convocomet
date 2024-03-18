import { preprocess } from 'svelte/compiler';
import sveltePreprocess from 'svelte-preprocess';
import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises';
import { join, sep as pathSeparator } from 'node:path';
import glob from 'fast-glob';
import { emitDts } from 'svelte2tsx';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
emitDts({
	declarationDir: 'dist',
	svelteShimsPath: require.resolve('svelte2tsx/svelte-shims.d.ts')
});

(await glob('src/**/*')).forEach(async (filename) => {
	const newFilename = join('dist', ...filename.split(pathSeparator).slice(1));
	await mkdir(join(...newFilename.split('/').slice(0, -1)), { recursive: true });
	if (filename.endsWith('.svelte')) {
		const content = await preprocess(
			(await readFile(filename)).toString(),
			sveltePreprocess({
				typescript: { tsconfigFile: './tsconfig.json' }
			}),
			{
				filename: newFilename.split('/').at(-1)
			}
		);
		await writeFile(
			newFilename,
			content.code.replace(
				' lang="ts"',
				'' // just don't question it https://github.com/sveltejs/svelte-preprocess/issues/260
			)
		);
	} else {
		await copyFile(filename, newFilename);
	}
});
