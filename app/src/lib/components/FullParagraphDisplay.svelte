<!-- src/lib/components/FullParagraphDisplay.svelte -->
<script lang="ts">
	let {
		sentences,
		currentSentenceIndex
	}: {
		sentences: string[];
		currentSentenceIndex: number;
	} = $props();
</script>

<div
	class="max-h-40 overflow-y-auto rounded-lg bg-slate-800/50 p-4 text-sm leading-relaxed shadow-inner"
>
	<h3 class="sr-only">Full Paragraph Context</h3>
	{#each sentences as sentence, i}
		<span
			class:font-bold={i === currentSentenceIndex}
			class:text-purple-200={i === currentSentenceIndex}
			class:bg-purple-500={i === currentSentenceIndex && 'bg-opacity-30'}
			class:rounded-sm={i === currentSentenceIndex}
			class:px-1={i === currentSentenceIndex}
			class:py-0.5={i === currentSentenceIndex}
			class:text-slate-400={i !== currentSentenceIndex}
		>
			{sentence}{i < sentences.length - 1 ? ' ' : ''}
		</span>
	{/each}
</div>

<style>
	div::-webkit-scrollbar {
		width: 6px;
	}
	div::-webkit-scrollbar-track {
		background-color: #1e293b; /* slate-800 */
		border-radius: 10px;
	}
	div::-webkit-scrollbar-thumb {
		background-color: #a855f7; /* purple-500 */
		border-radius: 10px;
	}
	div::-webkit-scrollbar-thumb:hover {
		background-color: #c084fc; /* purple-400 */
	}
</style>
