<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import FullParagraphDisplay from '$lib/components/FullParagraphDisplay.svelte';
	import PracticeDisplay from '$lib/components/PracticeDisplay.svelte';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';

	type $$Props = {
		whisperModule: any;
		whisperContextId: number | null;
		isModelLoaded: boolean;
		numThreadsForTranscription: number;
		languageForTranscription: string;
		onLog: (event: CustomEvent<{ text: string; type?: 'info' | 'error' | 'warn' }>) => void;
		onPracticeEnd: () => void;
		isWasmLoading: boolean;
		isWasmReady: boolean;
	};

	let {
		whisperModule,
		whisperContextId,
		isModelLoaded,
		numThreadsForTranscription,
		languageForTranscription,
		onLog,
		onPracticeEnd,
		isWasmLoading,
		isWasmReady
	}: $$Props = $props();
</script>

{#if !isModelLoaded && isWasmLoading}
	<div class="flex h-full flex-col items-center justify-center p-8 text-center">
		<div
			class="loader mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"
		></div>
		<p class="text-xl font-semibold text-slate-100">Initializing Whisper Audio Engine...</p>
		<p class="text-slate-400">
			This may take a moment. Please ensure you have a stable internet connection.
		</p>
	</div>
{:else if !isModelLoaded && !isWasmLoading && isWasmReady}
	<div class="flex h-full flex-col items-center justify-center p-8 text-center">
		<div
			class="loader mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"
		></div>
		<p class="text-xl font-semibold text-slate-100">Loading Whisper Model...</p>
		<p class="text-slate-400">
			The model for the selected language is being downloaded and initialized. This can take some
			time.
		</p>
	</div>
{/if}

<div class="flex flex-col items-center">
	<PracticeDisplay
		{whisperModule}
		{whisperContextId}
		{isModelLoaded}
		{numThreadsForTranscription}
		{languageForTranscription}
		on:log={onLog}
	/>
	<div class="mt-6">
		<Button
			onclick={onPracticeEnd}
			class="bg-violet-500 py-3 text-lg text-slate-100 hover:bg-violet-400"
			size="lg"
		>
			End Practice / New Passage
		</Button>
	</div>
</div>

<style>
	.loader {
		border-style: solid;
	}
</style>
