<!-- src/lib/components/guided/SentencePractice.svelte -->
<script lang="ts">
	import { lessonStore } from '$lib/stores/lessonStore';
	import PracticeDisplay from '$lib/components/PracticeDisplay.svelte';
	import ModelLoader from '$lib/components/whisper/ModelLoader.svelte';
	import { Button } from '$lib/components/ui/button';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
	import { createEventDispatcher } from 'svelte';

	let {
		whisperModule,
		whisperContextId, // <-- FIX: Accept whisperContextId as a prop
		isWasmReady,
		isWasmLoading,
		isModelLoaded
	}: {
		whisperModule: any;
		whisperContextId: number | null; // <-- FIX: Add type for the new prop
		isWasmReady: boolean;
		isWasmLoading: boolean;
		isModelLoaded: boolean;
	} = $props();

	const dispatch = createEventDispatcher<{
		modelInitialized: { contextId: number; modelName: string };
		modelUnloaded: void;
		log: { text: string; type?: 'info' | 'error' | 'warn' };
		notify: { type: 'success' | 'error' | 'info' | 'warning'; message: string };
	}>();

	let isLastSentence = $derived(
		$lessonStore.currentSentenceIndex === $lessonStore.sentences.length - 1
	);

	function handleAdvance() {
		if (isLastSentence) {
			lessonStore.startRecital();
		} else {
			lessonStore.advanceSentence();
		}
	}
</script>

<div class="flex w-full flex-col items-center">
	{#if isWasmLoading}
		<div class="flex h-64 flex-col items-center justify-center p-8 text-center">
			<LoaderCircleIcon class="mb-4 h-12 w-12 animate-spin text-purple-400" />
			<p class="text-xl font-semibold text-slate-100">Initializing Whisper Audio Engine...</p>
			<p class="text-slate-400">This may take a moment.</p>
		</div>
	{:else if !isModelLoaded && isWasmReady}
		<div class="w-full max-w-3xl">
			<ModelLoader
				{whisperModule}
				{isWasmReady}
				isWasmLoading={false}
				preferredLanguage={$lessonStore.currentLesson?.lang ?? 'es'}
				on:modelInitialized={(e) => dispatch('modelInitialized', e.detail)}
				on:modelUnloaded={() => dispatch('modelUnloaded')}
				on:log={(e) => dispatch('log', e.detail)}
				on:notify={(e) => dispatch('notify', e.detail)}
			/>
		</div>
	{:else if isModelLoaded}
		<PracticeDisplay
			sentences={$lessonStore.sentences}
			currentSentenceIndex={$lessonStore.currentSentenceIndex}
			on:advance={handleAdvance}
			{whisperModule}
			{whisperContextId}
			{isModelLoaded}
			numThreadsForTranscription={8}
			languageForTranscription={$lessonStore.currentLesson?.lang ?? 'es'}
			on:log={(e) => dispatch('log', e.detail)}
		/>
		<div class="mt-6">
			{#if isLastSentence}
				<Button
					onclick={() => lessonStore.startRecital()}
					size="lg"
					class="bg-emerald-600 text-lg text-white hover:bg-emerald-500"
				>
					Continue to Full Recital
				</Button>
			{:else}
				<Button
					onclick={() => lessonStore.advanceSentence()}
					variant="outline"
					size="lg"
					class="border-slate-600 bg-slate-700 text-lg hover:bg-slate-600"
				>
					Skip to Next Sentence
				</Button>
			{/if}
		</div>
	{:else}
		<div class="flex h-64 flex-col items-center justify-center p-8 text-center">
			<p class="text-xl font-semibold text-rose-400">
				Whisper Engine failed to initialize. Please refresh and try again.
			</p>
		</div>
	{/if}
</div>
