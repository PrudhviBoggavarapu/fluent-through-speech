<!-- src/lib/components/SentenceDisplay.svelte -->
<script lang="ts">
	import practiceStore from '$lib/stores/practiceStore';

	$: currentSentence = $practiceStore.sentences[$practiceStore.currentSentenceIndex] || '';
</script>

<div class="p-4 bg-secondary/20 rounded-lg text-center my-4">
	<h3 class="text-lg text-muted-foreground">Current Sentence:</h3>
	<p class="text-3xl font-semibold leading-relaxed text-foreground">
		{currentSentence}
	</p>
</div>
