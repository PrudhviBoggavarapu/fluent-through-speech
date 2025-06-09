<!-- src/lib/components/PracticeDisplay.svelte -->
<script lang="ts">
	import practiceStore, {
		advanceToNextPracticeItem,
		type CurrentPracticeDisplayItem
	} from '$lib/stores/practiceStore';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import FullParagraphDisplay from '$lib/components/FullParagraphDisplay.svelte';
	import AudioRecorder from '$lib/components/AudioRecorder.svelte';
	import { createEventDispatcher, onDestroy, type SvelteComponent } from 'svelte';
	import { kSampleRate, kMaxRecording_s } from '$lib/constants';
	import { toast } from 'svelte-sonner';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
	import { calculateSimilarity } from '$lib/utils/stringUtils';

	let {
		whisperModule,
		whisperContextId,
		isModelLoaded,
		numThreadsForTranscription = 8,
		languageForTranscription = 'es'
	}: {
		whisperModule: any;
		whisperContextId: number | null;
		isModelLoaded: boolean;
		numThreadsForTranscription?: number;
		languageForTranscription?: string;
	} = $props();

	let audioRecorderRef = $state<InstanceType<typeof AudioRecorder> | null>(null);

	let currentItem = $derived<CurrentPracticeDisplayItem>(
		$practiceStore.isPracticeMode &&
			$practiceStore.sentences.length > 0 &&
			$practiceStore.currentSentenceIndex >= 0 &&
			$practiceStore.currentSentenceIndex < $practiceStore.sentences.length
			? {
					text: $practiceStore.sentences[$practiceStore.currentSentenceIndex],
					type: 'sentence',
					originalSentenceIndex: $practiceStore.currentSentenceIndex
				}
			: null
	);

	let displayItemText = $state('');
	let displayTitleText = $state('');
	let overallMatchStatusMessage = $state('');
	let matchStatusColor = $state('text-slate-400'); // Default muted color
	let isTranscribingOrComparing = $state(false);
	let transcriptionPollInterval: any = null;

	const AUTO_ADVANCE_DELAY_MS = 1500;

	const dispatch = createEventDispatcher<{
		log: { text: string; type?: 'info' | 'error' | 'warn' };
	}>();

	function log(text: string, type: 'info' | 'error' | 'warn' = 'info') {
		console[type](`[PracticeDisplay] ${text}`);
		dispatch('log', { text: `[PracticeDisplay] ${text}`, type });
	}

	$effect(() => {
		const isPractice = $practiceStore.isPracticeMode;
		const currentSentenceIdx = $practiceStore.currentSentenceIndex;
		const totalSentences = $practiceStore.sentences.length;

		if (!isPractice || !currentItem) {
			displayTitleText = 'Practice Ended or No Item';
			displayItemText = '';
			if (!isPractice && totalSentences > 0) {
				displayTitleText = 'Practice Complete!';
			}
			overallMatchStatusMessage = '';
			matchStatusColor = 'text-slate-400';
			isTranscribingOrComparing = false;
			return;
		}

		const sentenceIdxHuman = currentItem.originalSentenceIndex + 1;
		displayTitleText = `Practice Sentence ${sentenceIdxHuman}/${totalSentences}:`;
		displayItemText = currentItem.text;
		overallMatchStatusMessage = 'Record your attempt below.';
		matchStatusColor = 'text-blue-400'; // Info color for initial prompt
		isTranscribingOrComparing = false;
	});

	function handleNextSentence() {
		if (audioRecorderRef?.isRecording()) audioRecorderRef.stop();
		isTranscribingOrComparing = false;
		if (transcriptionPollInterval) clearInterval(transcriptionPollInterval);
		transcriptionPollInterval = null;
		advanceToNextPracticeItem();
	}

	function handleAudioRecorderStatus(
		event: CustomEvent<{
			message: string;
			type: 'recording' | 'processing' | 'error' | 'info' | 'idle';
		}>
	) {
		overallMatchStatusMessage = event.detail.message;
		if (event.detail.type === 'recording') matchStatusColor = 'text-blue-400';
		else if (event.detail.type === 'processing') matchStatusColor = 'text-blue-400';
		else if (event.detail.type === 'error') matchStatusColor = 'text-rose-400';
		else matchStatusColor = 'text-slate-400';

		if (event.detail.type === 'idle' || event.detail.type === 'error') {
			isTranscribingOrComparing = false;
		}
	}

	function handleAudioRecorderError(event: CustomEvent<{ message: string; details?: any }>) {
		log(`AudioRecorder error: ${event.detail.message}`, 'error');
		overallMatchStatusMessage = event.detail.message;
		matchStatusColor = 'text-rose-400';
		isTranscribingOrComparing = false;
	}

	function handleAudioRecorderLog(
		event: CustomEvent<{ text: string; type?: 'info' | 'error' | 'warn' }>
	) {
		dispatch('log', event.detail);
	}

	async function handleAudioProcessed(event: CustomEvent<{ pcmf32: Float32Array }>) {
		const audioPCM32 = event.detail.pcmf32;
		log('Audio processed by AudioRecorder, proceeding to transcription.', 'info');
		isTranscribingOrComparing = true;
		overallMatchStatusMessage = 'Transcribing...';
		matchStatusColor = 'text-blue-400';
		await transcribeAndCompare(audioPCM32);
	}

	async function transcribeAndCompare(audioPCM32: Float32Array) {
		if (!isModelLoaded || !whisperContextId || !whisperModule) {
			log('Whisper model/context not ready for transcription.', 'error');
			toast.error('Whisper not ready.');
			overallMatchStatusMessage = 'Transcription service not ready.';
			matchStatusColor = 'text-rose-400';
			isTranscribingOrComparing = false;
			return;
		}

		if (!audioPCM32 || audioPCM32.length === 0) {
			log('CRITICAL: audioPCM32 is null or empty before transcription!', 'error');
			toast.error('Internal error: No audio data to transcribe.');
			overallMatchStatusMessage = 'Error: No audio data.';
			matchStatusColor = 'text-rose-400';
			isTranscribingOrComparing = false;
			return;
		}

		log(`Calling whisperModule.full_default...`);
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
				if (!whisperModule) {
					log('WASM Module became unavailable during polling.', 'error');
					clearInterval(transcriptionPollInterval);
					transcriptionPollInterval = null;
					isTranscribingOrComparing = false;
					overallMatchStatusMessage = 'Transcription failed (module lost).';
					matchStatusColor = 'text-rose-400';
					return;
				}
				try {
					if (whisperModule.is_transcription_done(whisperContextId)) {
						clearInterval(transcriptionPollInterval);
						transcriptionPollInterval = null;
						const transcribedText = whisperModule.get_transcription_result(whisperContextId);
						log(`Transcription result: "${transcribedText}"`, 'info');
						compareTranscriptionWithLevenshtein(transcribedText);
					} else {
						// log('Polling: Transcription not done yet...', 'info');
						overallMatchStatusMessage = 'Transcribing (polling)...';
						matchStatusColor = 'text-blue-400';
					}
				} catch (pollError: any) {
					log(`Error during transcription polling: ${pollError.message}`, 'error');
					clearInterval(transcriptionPollInterval);
					transcriptionPollInterval = null;
					toast.error(`Transcription polling error: ${pollError.message}`);
					overallMatchStatusMessage = 'Transcription polling error.';
					matchStatusColor = 'text-rose-400';
					isTranscribingOrComparing = false;
				}
			}, 500);
		} catch (e: any) {
			log(`Error calling/during whisperModule.full_default: ${e.message}`, 'error');
			toast.error(`Transcription error: ${e.message}`);
			overallMatchStatusMessage = `Transcription error: ${e.message.split('(')[0]}`;
			matchStatusColor = 'text-rose-400';
			isTranscribingOrComparing = false;
			if (transcriptionPollInterval) {
				clearInterval(transcriptionPollInterval);
				transcriptionPollInterval = null;
			}
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
		const originalNormalized = normalizeText(displayItemText);
		const transcribedNormalized = normalizeText(transcribedText);

		if (!transcribedNormalized && !originalNormalized) {
			overallMatchStatusMessage = 'Perfect Match! (Both empty) 🎉';
			matchStatusColor = 'text-emerald-400'; // Lighter for dark bg
			toast.success('Perfect Match! (Both empty)');
			setTimeout(() => {
				if ($practiceStore.isPracticeMode) advanceToNextPracticeItem();
				isTranscribingOrComparing = false;
			}, AUTO_ADVANCE_DELAY_MS);
			return;
		}
		if (!transcribedNormalized && originalNormalized) {
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
			matchStatusColor = 'text-emerald-400'; // Still positive
			shouldAutoAdvance = true;
		} else if (similarity >= 50) {
			overallMatchStatusMessage = `Partial Match. (${similarity.toFixed(0)}%) Keep trying!`;
			matchStatusColor = 'text-amber-400'; // Lighter for dark bg
		} else {
			overallMatchStatusMessage = `Needs Improvement. (${similarity.toFixed(0)}%) Try again. 🙁`;
			matchStatusColor = 'text-rose-400';
		}

		if (shouldAutoAdvance) {
			setTimeout(() => {
				if ($practiceStore.isPracticeMode) advanceToNextPracticeItem();
				isTranscribingOrComparing = false;
			}, AUTO_ADVANCE_DELAY_MS);
		} else {
			isTranscribingOrComparing = false;
		}
	}

	let isRecorderBusy = $derived(
		audioRecorderRef ? audioRecorderRef.isRecording() || audioRecorderRef.isProcessing() : false
	);
	let isOverallBusy = $derived(isRecorderBusy || isTranscribingOrComparing);

	onDestroy(() => {
		log('PracticeDisplay onDestroy.', 'info');
		if (transcriptionPollInterval) clearInterval(transcriptionPollInterval);
	});
</script>

<div class="flex w-full max-w-2xl flex-col items-center text-slate-100">
	<h1 class="mb-4 text-center text-3xl font-bold text-slate-100">Practice Mode</h1>
	{#if $practiceStore.sentences.length > 0 && $practiceStore.currentSentenceIndex >= 0}
		<FullParagraphDisplay />
	{/if}

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

	{#if $practiceStore.isPracticeMode && displayItemText && displayItemText !== '...'}
		<div class="mt-4 flex items-start justify-center space-x-4">
			<Button
				onclick={handleNextSentence}
				size="lg"
				class="bg-violet-500 text-slate-100 hover:bg-purple-400 active:bg-purple-600 disabled:bg-slate-700 disabled:text-slate-400"
				disabled={isOverallBusy}
			>
				Next Sentence
			</Button>
			<AudioRecorder
				bind:this={audioRecorderRef}
				maxRecordingSeconds={kMaxRecording_s}
				targetSampleRate={kSampleRate}
				disabled={!isModelLoaded || !whisperContextId || isTranscribingOrComparing}
				on:processed={handleAudioProcessed}
				on:status={handleAudioRecorderStatus}
				on:log={handleAudioRecorderLog}
				on:error={handleAudioRecorderError}
			/>
		</div>
		{#if isTranscribingOrComparing && !isRecorderBusy}
			<div class="mt-3 flex w-full max-w-xs flex-col items-center">
				<LoaderCircleIcon class="h-6 w-6 animate-spin text-purple-400" />
				<p class="mt-1 text-center text-sm {matchStatusColor}">
					{overallMatchStatusMessage || 'Processing...'}
				</p>
			</div>
		{/if}
	{:else if $practiceStore.isPracticeMode && (!isModelLoaded || !whisperContextId)}
		<p class="mt-4 text-center text-lg text-slate-400">
			Waiting for Whisper model to load before enabling recording...
		</p>
	{/if}

	{#if overallMatchStatusMessage && !isOverallBusy}
		{@const recorderIsActuallyRecording = audioRecorderRef ? audioRecorderRef.isRecording() : false}
		{@const recorderIsActuallyProcessing = audioRecorderRef
			? audioRecorderRef.isProcessing()
			: false}
		{#if !recorderIsActuallyRecording && !recorderIsActuallyProcessing}
			<p class="mt-4 text-center text-lg {matchStatusColor}">{overallMatchStatusMessage}</p>
		{/if}
	{/if}

	{#if $practiceStore.sentences.length > 0}
		<p class="mt-4 text-sm text-slate-400">
			{#if $practiceStore.isPracticeMode && currentItem}
				Sentence {$practiceStore.currentSentenceIndex + 1}/{$practiceStore.sentences.length}
			{:else if !$practiceStore.isPracticeMode && $practiceStore.sentences.length > 0}
				Practice complete or ended.
			{/if}
		</p>
	{/if}
</div>
