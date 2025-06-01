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

	const dispatch = createEventDispatcher<{
		practiceStarted: void; // To notify parent that practice mode is being initiated
	}>();

	function handleStartPractice() {
		if (paragraph.trim()) {
			startPractice(paragraph); // This will set $practiceStore.isPracticeMode = true
			// The parent (+page.svelte) will react to $practiceStore.isPracticeMode
			// and initialize Whisper if needed.
			dispatch('practiceStarted');
		}
	}
</script>

<div class="mx-auto grid w-full max-w-2xl gap-2 p-4">
	<h2 class="mb-4 text-center text-2xl font-bold">FluentThroughSpeech</h2>
	<p class="text-muted-foreground mb-6 text-center">
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
	<Button onclick={handleStartPractice} class="mt-4" disabled={$practiceStore.isPracticeMode}>
		Start Practice
	</Button>
</div>
