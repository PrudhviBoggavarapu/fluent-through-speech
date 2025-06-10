<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import FullParagraphDisplay from '$lib/components/FullParagraphDisplay.svelte';
	import AudioRecorder from '$lib/components/AudioRecorder.svelte';
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { kSampleRate, kMaxRecording_s } from '$lib/constants';
	import { toast } from 'svelte-sonner';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
	import { calculateSimilarity } from '$lib/utils/stringUtils';

	let {
		sentences,
		currentSentenceIndex,
		whisperModule,
		whisperContextId,
		isModelLoaded,
		numThreadsForTranscription = 8,
		languageForTranscription = 'es'
	}: {
		sentences: string[];
		currentSentenceIndex: number;
		whisperModule: any;
		whisperContextId: number | null;
		isModelLoaded: boolean;
		numThreadsForTranscription?: number;
		languageForTranscription?: string;
	} = $props();

	let audioRecorderRef = $state<InstanceType<typeof AudioRecorder> | null>(null);

	let displayItemText = $state('');
	let displayTitleText = $state('');
	let overallMatchStatusMessage = $state('');
	let matchStatusColor = $state('text-slate-400');
	let isTranscribingOrComparing = $state(false);
	let transcriptionPollInterval: any = null;
	let lastTranscribedText = $state<string | null>(null);

	const AUTO_ADVANCE_DELAY_MS = 3000;

	const dispatch = createEventDispatcher<{
		log: { text: string; type?: 'info' | 'error' | 'warn' };
		advance: void;
	}>();

	function log(text: string, type: 'info' | 'error' | 'warn' = 'info') {
		console[type](`[PracticeDisplay] ${text}`);
		dispatch('log', { text: `[PracticeDisplay] ${text}`, type });
	}

	$effect(() => {
		const totalSentences = sentences.length;
		if (currentSentenceIndex < 0 || currentSentenceIndex >= totalSentences) {
			displayTitleText = 'Practice Ended or No Item';
			displayItemText = '';
			return;
		}

		const sentenceIdxHuman = currentSentenceIndex + 1;
		displayTitleText = `Practice Sentence ${sentenceIdxHuman}/${totalSentences}:`;
		displayItemText = sentences[currentSentenceIndex];
		overallMatchStatusMessage = 'Record your attempt below.';
		matchStatusColor = 'text-blue-400';
		isTranscribingOrComparing = false;
		lastTranscribedText = null;
	});

	function handleAudioProcessed(event: CustomEvent<{ pcmf32: Float32Array }>) {
		const audioPCM32 = event.detail.pcmf32;
		isTranscribingOrComparing = true;
		overallMatchStatusMessage = 'Transcribing...';
		matchStatusColor = 'text-blue-400';
		lastTranscribedText = null;
		transcribeAndCompare(audioPCM32);
	}

	async function transcribeAndCompare(audioPCM32: Float32Array) {
		if (!isModelLoaded || !whisperContextId || !whisperModule) {
			toast.error('Whisper not ready.');
			isTranscribingOrComparing = false;
			return;
		}

		try {
			if (transcriptionPollInterval) clearInterval(transcriptionPollInterval);

			const ret = whisperModule.full_default(
				whisperContextId,
				audioPCM32,
				languageForTranscription,
				numThreadsForTranscription,
				false
			);
			if (ret !== 0) throw new Error(`Whisper C API returned error code: ${ret}`);

			transcriptionPollInterval = setInterval(() => {
				if (whisperModule.is_transcription_done(whisperContextId)) {
					clearInterval(transcriptionPollInterval);
					const transcribedText = whisperModule.get_transcription_result(whisperContextId);
					compareTranscriptionWithLevenshtein(transcribedText);
				}
			}, 500);
		} catch (e: any) {
			toast.error(`Transcription error: ${e.message}`);
			isTranscribingOrComparing = false;
		}
	}

	function normalizeText(text: string): string {
		return text
			.toLowerCase()
			.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"]/g, '')
			.replace(/\s{2,}/g, ' ')
			.trim();
	}

	function compareTranscriptionWithLevenshtein(transcribedText: string) {
		lastTranscribedText = transcribedText;
		const originalNormalized = normalizeText(displayItemText);
		const transcribedNormalized = normalizeText(transcribedText);

		if (!transcribedNormalized) {
			overallMatchStatusMessage = 'No speech detected. Try again. 🙁';
			matchStatusColor = 'text-rose-400';
			toast.error('No speech detected.');
			isTranscribingOrComparing = false;
			return;
		}

		const similarity = calculateSimilarity(originalNormalized, transcribedNormalized);
		let shouldAutoAdvance = false;

		if (similarity >= 95) {
			overallMatchStatusMessage = `Perfect Match! (${similarity.toFixed(0)}%) 🎉`;
			matchStatusColor = 'text-emerald-400';
			shouldAutoAdvance = true;
		} else if (similarity >= 75) {
			overallMatchStatusMessage = `Good Match! (${similarity.toFixed(0)}%) 👍`;
			matchStatusColor = 'text-emerald-400';
			shouldAutoAdvance = true;
		} else if (similarity >= 50) {
			overallMatchStatusMessage = `Partial Match. (${similarity.toFixed(0)}%) Keep trying!`;
			matchStatusColor = 'text-amber-400';
		} else {
			overallMatchStatusMessage = `Needs Improvement. (${similarity.toFixed(0)}%) Try again. 🙁`;
			matchStatusColor = 'text-rose-400';
		}

		if (shouldAutoAdvance) {
			setTimeout(() => {
				dispatch('advance');
				isTranscribingOrComparing = false;
			}, AUTO_ADVANCE_DELAY_MS);
		} else {
			isTranscribingOrComparing = false;
		}
	}

	onDestroy(() => {
		if (transcriptionPollInterval) clearInterval(transcriptionPollInterval);
	});
</script>

<div class="flex w-full max-w-4xl flex-col items-center text-slate-100">
	<FullParagraphDisplay {sentences} {currentSentenceIndex} />

	<Card class="my-6 w-full bg-slate-800 p-4 text-slate-100 shadow-lg">
		<CardHeader>
			<CardTitle class="text-center text-lg text-slate-300">
				{displayTitleText}
			</CardTitle>
		</CardHeader>
		<CardContent>
			<p
				class="flex min-h-[2em] items-center justify-center text-center text-5xl leading-tight font-extrabold text-purple-200"
			>
				{displayItemText || '...'}
			</p>
		</CardContent>
	</Card>

	{#if lastTranscribedText !== null && !isTranscribingOrComparing}
		<div class="mb-6 w-full rounded-lg bg-slate-700/50 p-4">
			<h3 class="text-sm font-semibold tracking-wider text-slate-400 uppercase">Whisper heard:</h3>
			<p class="mt-2 text-2xl text-slate-300 italic">
				{#if lastTranscribedText}
					"{lastTranscribedText}"
				{:else}
					<span class="text-slate-400">(No speech detected)</span>
				{/if}
			</p>
		</div>
	{/if}

	<div class="mt-4 flex items-start justify-center space-x-4">
		<AudioRecorder
			bind:this={audioRecorderRef}
			maxRecordingSeconds={kMaxRecording_s}
			targetSampleRate={kSampleRate}
			disabled={!isModelLoaded || isTranscribingOrComparing}
			on:processed={handleAudioProcessed}
		/>
	</div>
	{#if isTranscribingOrComparing}
		<div class="mt-3 flex w-full max-w-xs flex-col items-center">
			<LoaderCircleIcon class="h-6 w-6 animate-spin text-purple-400" />
			<p class="mt-1 text-center text-sm {matchStatusColor}">
				{overallMatchStatusMessage || 'Processing...'}
			</p>
		</div>
	{/if}

	{#if overallMatchStatusMessage && !isTranscribingOrComparing}
		<p class="mt-4 text-center text-lg {matchStatusColor}">{overallMatchStatusMessage}</p>
	{/if}
</div>
