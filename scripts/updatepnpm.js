import { globby } from 'globby';
import { readFile, writeFile } from 'fs/promises';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const packageFiles = await globby('**/package.json', {
	gitignore: true
});
const pnpm = await (await fetch('https://registry.npmjs.org/pnpm/latest')).json();
const version = pnpm._id;

console.log(`New pnpm version: ${version}`);
console.log('Updated files');
console.log(packageFiles);

const rl = createInterface({ input: stdin, output: stdout });
const approval = (await rl.question('Continue with updates? [y/N] ')).toLowerCase();
rl.close();

if (approval === 'y' || approval === 'yes') {
	await Promise.all(
		packageFiles.map(async (fileName) => {
			const file = JSON.parse(await readFile(fileName));
			file.packageManager = version;
			await writeFile(fileName, JSON.stringify(file));
		})
	);
	console.log('Updates complete');
} else {
	console.log('Exiting');
}
