<script lang="ts">
	import { afterUpdate } from 'svelte';

	export let logOutput: string;
	let textareaElement: HTMLTextAreaElement;

	afterUpdate(() => {
		if (textareaElement) {
			textareaElement.scrollTop = textareaElement.scrollHeight;
		}
	});
</script>

<div class="rounded-lg border border-slate-700 bg-slate-800 text-slate-100 shadow-md">
	<div class="p-6">
		<h2 class="text-xl font-semibold tracking-tight text-slate-100">Event Log</h2>
	</div>
	<div class="p-6 pt-0">
		<textarea
			bind:this={textareaElement}
			id="log-output-area"
			class="h-64 w-full resize-none rounded-md border border-slate-600 bg-slate-700/50 p-3 font-mono text-xs text-slate-300 placeholder-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
			readonly
			value={logOutput}
			placeholder="Log messages will appear here..."
		></textarea>
	</div>
</div>
