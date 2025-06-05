<!-- src/lib/components/ParagraphInput.svelte -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import practiceStore, { startPractice } from '$lib/stores/practiceStore';
	import { createEventDispatcher } from 'svelte';

	type $$Props = {
		initialParagraph?: string;
		disabled?: boolean;
	};

	let { initialParagraph = 'Error: Story content not loaded.', disabled = false }: $$Props =
		$props();

	let paragraph = $state(initialParagraph);

	const dispatch = createEventDispatcher<{
		practiceStarted: void;
	}>();

	$effect(() => {
		if (!$practiceStore.isPracticeMode) {
			if (paragraph !== initialParagraph) {
				paragraph = initialParagraph;
			}
		}
	});

	function handleStartPractice() {
		if (paragraph && paragraph.trim()) {
			startPractice(paragraph);
			dispatch('practiceStarted');
		} else {
			console.warn('ParagraphInput: Cannot start practice with empty text.');
		}
	}
</script>

<div class="mx-auto grid w-full max-w-2xl gap-2">
	<Label for="paragraphInput" class="text-lg font-medium text-slate-300">Your Practice Text</Label>
	<Textarea
		id="paragraphInput"
		bind:value={paragraph}
		placeholder="Select a story or paste your paragraph here..."
		rows={8}
		class="resize-y border-slate-600 bg-slate-700 text-base text-slate-100 placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900"
		disabled={$practiceStore.isPracticeMode || disabled}
	/>
	<Button
		onclick={handleStartPractice}
		class="mt-4 w-full bg-purple-500 py-3 text-lg text-slate-100 hover:bg-purple-400 active:bg-purple-600 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
		disabled={$practiceStore.isPracticeMode || !paragraph || !paragraph.trim() || disabled}
		size="lg"
	>
		Start Practice
	</Button>
</div>
