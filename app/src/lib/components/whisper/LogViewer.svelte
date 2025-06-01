<script lang="ts">
	import { afterUpdate } from 'svelte';
	import {
		cardClasses,
		cardHeaderClasses,
		cardTitleClasses,
		cardContentClasses,
		textareaClasses
	} from '$lib/uiClasses';

	export let logOutput: string;
	let textareaElement: HTMLTextAreaElement;

	afterUpdate(() => {
		if (textareaElement) {
			textareaElement.scrollTop = textareaElement.scrollHeight;
		}
	});
</script>

<div class={cardClasses}>
	<div class={cardHeaderClasses}>
		<h2 class={cardTitleClasses}>Event Log</h2>
	</div>
	<div class={cardContentClasses}>
		<textarea
			bind:this={textareaElement}
			id="log-output-area"
			class="{textareaClasses} bg-muted/50 h-64 font-mono text-xs"
			readonly
			value={logOutput}
			placeholder="Log messages will appear here..."
		></textarea>
	</div>
</div>
