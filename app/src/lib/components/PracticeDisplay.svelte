<!-- src/lib/components/PracticeDisplay.svelte -->
<script lang="ts">
	import practiceStore, {
		advanceToNextPracticeItem,
		type CurrentPracticeDisplayItem
	} from '$lib/stores/practiceStore';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import FullParagraphDisplay from '$lib/components/FullParagraphDisplay.svelte';

	let currentItem = $derived<CurrentPracticeDisplayItem>(
		($practiceStore.isPracticeMode &&
		$practiceStore.sentences.length > 0 &&
		$practiceStore.currentSentenceIndex >= 0 &&
		$practiceStore.currentSentenceIndex < $practiceStore.sentences.length)
			? {
					text: $practiceStore.sentences[$practiceStore.currentSentenceIndex],
					type: 'sentence', // Only type is 'sentence' now
					originalSentenceIndex: $practiceStore.currentSentenceIndex
				}
			: null
	);

	let displayItemText = $state('');
	let displayTitleText = $state('');

	$effect(() => {
		const isPractice = $practiceStore.isPracticeMode;
		const currentSentenceIdx = $practiceStore.currentSentenceIndex;
		const totalSentences = $practiceStore.sentences.length;

		console.log(
			`[PracticeDisplay] Effect. isPractice: ${isPractice}, currentItem:`,
			currentItem ? `${currentItem.type} - ${currentItem.text}` : 'null'
		);

		if (!isPractice || !currentItem) {
			displayTitleText = 'Practice Ended or No Item';
			displayItemText = '';
			if (!isPractice && totalSentences > 0) {
				displayTitleText = 'Practice Complete!';
			}
			return;
		}

		const sentenceIdxHuman = currentItem.originalSentenceIndex + 1;

		displayTitleText = `Practice Sentence ${sentenceIdxHuman}/${totalSentences}:`;
		displayItemText = currentItem.text;

		console.log(`[PracticeDisplay] Set display: Title="${displayTitleText}", Item="${displayItemText}"`);
	});

	function handleNextSentence() {
		console.log(`[PracticeDisplay] "Next Sentence" clicked for: ${displayItemText}`);
		advanceToNextPracticeItem();
	}
</script>

<div class="max-w-2xl w-full flex flex-col items-center">
	<h1 class="text-3xl font-bold mb-4 text-center">Practice Mode</h1>
	{#if $practiceStore.sentences.length > 0 && $practiceStore.currentSentenceIndex >= 0}
		<FullParagraphDisplay />
	{/if}

	<Card class="w-full my-6 p-4">
		<CardHeader>
			<CardTitle class="text-center text-lg text-muted-foreground">
				{displayTitleText}
			</CardTitle>
		</CardHeader>
		<CardContent>
			<p
				class="text-5xl font-extrabold text-center text-primary leading-tight min-h-[2em] flex items-center justify-center"
			>
				{displayItemText || '...'}
			</p>
		</CardContent>
	</Card>

	{#if $practiceStore.isPracticeMode && displayItemText && displayItemText !== '...'}
		<Button onclick={handleNextSentence} size="lg" class="mt-4"> Next Sentence </Button>
	{/if}

	{#if $practiceStore.sentences.length > 0}
		<p class="text-sm text-muted-foreground mt-4">
			{#if $practiceStore.isPracticeMode && currentItem}
				Sentence {$practiceStore.currentSentenceIndex + 1}/{$practiceStore.sentences.length}
			{:else if !$practiceStore.isPracticeMode && $practiceStore.sentences.length > 0}
				Practice complete or ended.
			{/if}
		</p>
	{/if}
</div>