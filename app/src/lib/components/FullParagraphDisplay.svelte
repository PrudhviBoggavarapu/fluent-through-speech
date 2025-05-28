<!-- src/lib/components/FullParagraphDisplay.svelte -->
<script lang="ts">
	import practiceStore from '$lib/stores/practiceStore';

	$: sentences = $practiceStore.sentences;
	$: currentSentenceIndex = $practiceStore.currentSentenceIndex;
</script>

<div class="p-4 bg-muted/30 rounded-lg text-sm leading-relaxed max-h-40 overflow-y-auto">
	<h3 class="sr-only">Full Paragraph Context</h3>
	{#each sentences as sentence, i}
		<span
			class={i === currentSentenceIndex
				? 'font-bold text-primary bg-primary/20 rounded-sm px-1 py-0.5'
				: 'text-muted-foreground'}
		>
			{sentence}{i < sentences.length - 1 ? ' ' : ''}
		</span>
	{/each}
</div>
