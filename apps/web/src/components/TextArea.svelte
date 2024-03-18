<script lang="ts">
	import { onMount, tick } from 'svelte';
	import Button from './Button.svelte';
	export let id = undefined;
	export let value = '';
	export let autocomplete = '';
	export let placeholder = '';
	export let description: string = undefined;
	export let required = false;
	export let maxlength: number = undefined;
	export let minlength: number = undefined;
	export let title: string = undefined;
	export let resize: boolean = false;
	export let rows = 2;
	export let shadow = true;
	export let markdown = false;
	let className = '';
	let textbox: HTMLTextAreaElement;
	const outerClasses = `rounded-md b-1 b-neutral-1 flex flex-col ${shadow ? '!shadow-md ' : ''}`;
	const sharedClasses = `px-6 py-3 bg-base-1`;
	const inputClasses = `${sharedClasses} outline-none focus:outline-none ring-primary-medium focus:ring-2`;

	async function setSelectionRange(beginning: number, end: number = beginning) {
		await tick();
		textbox.setSelectionRange(beginning, end);
	}
	function insertFormatting(before: string = '', after: string = '', event: Event) {
		if (textbox.selectionStart !== textbox.selectionEnd) {
			// text in textbox selected; wrap selection with formatting
			const selectLoc = textbox.selectionStart + before.length;
			const selectEndLoc = textbox.selectionEnd + before.length;
			value =
				value.slice(0, textbox.selectionStart) +
				before +
				value.slice(textbox.selectionStart, textbox.selectionEnd) +
				after +
				value.slice(textbox.selectionEnd, value.length);
			setSelectionRange(selectLoc, selectEndLoc);
		} else if (textbox.selectionStart === value.length) {
			// text in textbox not selected or selection at end; insert formatting at end
			value = value + before + after;
			const selectLoc = value.length - after.length;
			textbox.focus();
			setSelectionRange(selectLoc);
		} else {
			// selection inside text but not highlighting anything; insert formatting around nearest word
			const selectLoc = textbox.selectionStart + before.length;
			let i = 0;
			let done = false;
			value = value
				.split(' ')
				.map((val) => {
					if (done === true) return val;
					i += val.length;
					if (textbox.selectionStart < i) {
						// current word is selected
						done = true;
						return before + val + after;
					}
					return val;
				})
				.join(' ');
			setSelectionRange(selectLoc);
		}
	}
	async function getHTML() {
		const snarkdown = (await import('snarkdown')).default;
		return snarkdown(value);
	}
	async function terminateEvent(e) {
		e.preventDefault();
		e.stopPropagation();
	}
	export { className as class };
	let preview = false;
</script>

{#if markdown}
	<label class="flex flex-col" for={id}>
		<div class="ml-2 text-lg font-500"><slot /></div>
		{#if description}<p class="text-gray-500 text-sm ml-2">{description}</p>{/if}
	</label>
	<div class={outerClasses}>
		<div class="flex b-b-1 b-neutral-1">
			<Button
				type="tertiary"
				class="bold !rounded-b-none !rounded-r-none ring-primary"
				action="button"
				title="Bold"
				size="square"
				on:click={(e) => insertFormatting('**', '**', e)}
				on:mousedown={terminateEvent}>B</Button
			>
			<Button
				type="tertiary"
				class="italic !rounded-none"
				action="button"
				title="Italic"
				size="square"
				on:click={(e) => insertFormatting('*', '*', e)}
				on:mousedown={terminateEvent}>I</Button
			>
			<Button
				type="tertiary"
				class="underline !rounded-none"
				action="button"
				title="Underline"
				size="square"
				on:click={(e) => insertFormatting('__', '__', e)}
				on:mousedown={terminateEvent}>U</Button
			>
			<Button
				type="tertiary"
				class="line-through !rounded-none"
				action="button"
				title="Strikethrough"
				size="square"
				on:click={(e) => insertFormatting('~~', '~~', e)}
				on:mousedown={terminateEvent}>S</Button
			>
			<Button
				type="tertiary"
				action="button"
				class="!rounded-b-none !rounded-l-none ml-auto"
				size="square"
				on:click={() => (preview = !preview)}>{preview ? 'Source' : 'Preview'}</Button
			>
		</div>
		{#if preview}
			<div class="{sharedClasses} rounded-b-md" style="height: {1.5 * (rows + 1)}rem">
				{#await getHTML()}Loading preview{:then val}{@html val}{/await}
			</div>
		{:else}
			<textarea
				{autocomplete}
				{placeholder}
				{required}
				{maxlength}
				{minlength}
				{title}
				{rows}
				{id}
				bind:value
				bind:this={textbox}
				class="{inputClasses} rounded-b-md {resize ? '' : 'resize-none '}{className}"
			/>
		{/if}
	</div>
{:else}
	<label class="flex flex-col">
		<div class="ml-2 text-lg font-500"><slot /></div>
		{#if description}<p class="text-gray-500 text-sm ml-2">{description}</p>{/if}
		<textarea
			{autocomplete}
			{placeholder}
			{required}
			{maxlength}
			{minlength}
			{title}
			{rows}
			bind:value
			bind:this={textbox}
			class=" {resize ? '' : 'resize-none '}{outerClasses}{className}"
		/>
	</label>
{/if}
