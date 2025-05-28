<!-- src/lib/components/ParagraphInput.svelte -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import practiceStore, { startPractice } from '$lib/stores/practiceStore';
	import { createEventDispatcher } from 'svelte';

	let paragraph = $state(
		`The quick brown fox jumps over the lazy dog. This is a common pangram. It contains every letter of the alphabet. You can use it to test typefaces or keyboards. What a fun sentence!`
	);

	const dispatch = createEventDispatcher();

	function handleStartPractice() {
		if (paragraph.trim()) {
			startPractice(paragraph);
			// Dispatch event if practice mode was successfully entered
			if ($practiceStore.isPracticeMode) {
				dispatch('practiceStarted');
			}
		}
	}
</script>

<div class="grid w-full gap-2 p-4 max-w-2xl mx-auto">
	<h2 class="text-2xl font-bold mb-4 text-center">FluentThroughSpeech</h2>
	<p class="text-center text-muted-foreground mb-6">
		Paste or type a paragraph to start your speech practice.
	</p>
	<Label for="paragraphInput">Your Paragraph</Label>
	<Textarea
		id="paragraphInput"
		bind:value={paragraph}
		placeholder="Type or paste your paragraph here..."
		rows={8}
		class="resize-y"
		disabled={$practiceStore.isPracticeMode}
	/>
	<Button
		onclick={handleStartPractice}
		class="mt-4"
		disabled={$practiceStore.isPracticeMode}
	>
		Start Practice
	</Button>
</div>