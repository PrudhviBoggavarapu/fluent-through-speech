<!-- src/routes/+page.svelte -->
<script lang="ts">
	import practiceStore, { resetPractice } from '$lib/stores/practiceStore';
	import ParagraphInput from '$lib/components/ParagraphInput.svelte';
	import PracticeDisplay from '$lib/components/PracticeDisplay.svelte';
	import { Button } from '$lib/components/ui/button';
</script>

<div class="min-h-screen bg-background text-foreground flex flex-col items-center p-4">
	{#if !$practiceStore.isPracticeMode}
		<ParagraphInput />
	{:else}
		<PracticeDisplay />
		<Button onclick={resetPractice} variant="outline" class="mt-8">
			End Practice / New Paragraph
		</Button>
	{/if}
</div>