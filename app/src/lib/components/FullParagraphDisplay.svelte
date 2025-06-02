<!-- src/lib/components/FullParagraphDisplay.svelte -->
<script lang="ts">
	import practiceStore from '$lib/stores/practiceStore';

	// No need for $: here as $practiceStore is already reactive
	// and its properties will be accessed reactively in the template.
</script>

<div
	class="max-h-40 overflow-y-auto rounded-lg bg-slate-800/50 p-4 text-sm leading-relaxed shadow-inner"
>
	<!-- 
		Alternative background if you want it more opaque: 
		class="max-h-40 overflow-y-auto rounded-lg bg-slate-700 p-4 text-sm leading-relaxed" 
	-->
	<h3 class="sr-only">Full Paragraph Context</h3>
	{#each $practiceStore.sentences as sentence, i}
		<span
			class:font-bold={i === $practiceStore.currentSentenceIndex}
			class:text-purple-200={i === $practiceStore.currentSentenceIndex}
			class:bg-purple-500={i === $practiceStore.currentSentenceIndex && 'bg-opacity-30'}
			class:rounded-sm={i === $practiceStore.currentSentenceIndex}
			class:px-1={i === $practiceStore.currentSentenceIndex}
			class:py-0.5={i === $practiceStore.currentSentenceIndex}
			class:text-slate-400={i !== $practiceStore.currentSentenceIndex}
		>
			{sentence}{i < $practiceStore.sentences.length - 1 ? ' ' : ''}
		</span>
	{/each}
</div>

<style>
	/* Custom scrollbar for this specific component if needed, similar to the sidebar */
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
