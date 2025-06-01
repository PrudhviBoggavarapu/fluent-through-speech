<!-- src/lib/components/PracticeDisplay.svelte -->
<script lang="ts">
	import practiceStore, {
		advanceToNextPracticeItem,
		type CurrentPracticeDisplayItem
	} from '$lib/stores/practiceStore';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import FullParagraphDisplay from '$lib/components/FullParagraphDisplay.svelte';
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { kSampleRate, kMaxRecording_s } from '$lib/constants';
	import { toast } from 'svelte-sonner';
	import MicIcon from '@lucide/svelte/icons/mic';
	import StopCircleIcon from '@lucide/svelte/icons/stop-circle';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
	import { Progress } from '$lib/components/ui/progress';
	import { calculateSimilarity } from '$lib/utils/stringUtils';

	let {
		whisperModule,
		whisperContextId,
		isModelLoaded,
		numThreadsForTranscription = 8,
		languageForTranscription = 'en'
	}: {
		whisperModule: any;
		whisperContextId: number | null;
		isModelLoaded: boolean;
		numThreadsForTranscription?: number;
		languageForTranscription?: string;
	} = $props();

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

	let isRecordingAudioForMatch = $state(false);
	let matchStatusMessage = $state('');
	let mediaRecorderForMatch: MediaRecorder | null = null;
	let audioChunksForMatch: Blob[] = [];
	let audioContextForMatch: AudioContext | null = null;
	let transcriptionPollInterval: any = null;
	let isMatchingInProgress = $state(false);

	let recordProgress = $state(0);
	let recordStartTime = $state(0);
	let recordInterval: any = null;

	const AUTO_ADVANCE_DELAY_MS = 1500; // Delay in milliseconds before auto-advancing

	const dispatch = createEventDispatcher<{
		log: { text: string; type?: 'info' | 'error' | 'warn' };
	}>();

	function log(text: string, type: 'info' | 'error' | 'warn' = 'info') {
		console[type](`[PracticeDisplay] ${text}`);
		dispatch('log', { text: `[PracticeDisplay] ${text}`, type });
	}

	function getAudioContextForMatch(): AudioContext {
		if (!audioContextForMatch || audioContextForMatch.state === 'closed') {
			log('Creating new AudioContext for matching.', 'info');
			audioContextForMatch = new AudioContext({
				sampleRate: kSampleRate,
				channelCount: 1
			} as AudioContextOptions);
		}
		return audioContextForMatch;
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
			matchStatusMessage = '';
			recordProgress = 0;
			return;
		}

		const sentenceIdxHuman = currentItem.originalSentenceIndex + 1;
		displayTitleText = `Practice Sentence ${sentenceIdxHuman}/${totalSentences}:`;
		displayItemText = currentItem.text;
		matchStatusMessage = '';
		recordProgress = 0;
	});

	function handleNextSentence() {
		advanceToNextPracticeItem();
	}

	async function startRecordingForMatch() {
		if (isRecordingAudioForMatch) {
			log('Already recording.', 'warn');
			return;
		}
		if (!isModelLoaded || !whisperContextId) {
			toast.error('Cannot start recording: Whisper model not ready.');
			log('Attempted to record but model/context not loaded.', 'error');
			return;
		}

		isRecordingAudioForMatch = true;
		isMatchingInProgress = true;
		recordProgress = 0;
		audioChunksForMatch = [];
		log('Starting microphone recording for matching...');

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
			const ctx = getAudioContextForMatch();
			if (ctx.state === 'suspended') {
				log('AudioContext was suspended, resuming.', 'info');
				await ctx.resume();
			}

			mediaRecorderForMatch = new MediaRecorder(stream);
			mediaRecorderForMatch.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunksForMatch.push(event.data);
				}
			};

			mediaRecorderForMatch.onstop = async () => {
				stream.getTracks().forEach((track) => track.stop());
				if (recordInterval) clearInterval(recordInterval);
				recordInterval = null;
				matchStatusMessage = 'Processing recording...';
				log('Recording stopped. Processing for matching...');

				if (audioChunksForMatch.length === 0) {
					log('No audio data recorded for matching.', 'warn');
					toast.warning('No audio data recorded.');
					matchStatusMessage = 'No audio recorded. Try again.';
					isMatchingInProgress = false;
					return;
				}

				const mimeType = mediaRecorderForMatch?.mimeType || 'audio/webm';
				const audioBlob = new Blob(audioChunksForMatch, { type: mimeType });
				audioChunksForMatch = [];

				try {
					const arrayBuffer = await audioBlob.arrayBuffer();
					log(
						`Recorded blob size: ${audioBlob.size}, ArrayBuffer length: ${arrayBuffer.byteLength}`,
						'info'
					);
					const decodedAudioBuffer = await ctx.decodeAudioData(arrayBuffer);
					log(
						`Decoded AudioBuffer: duration ${decodedAudioBuffer.duration.toFixed(2)}s, channels ${decodedAudioBuffer.numberOfChannels}, sampleRate ${decodedAudioBuffer.sampleRate}`,
						'info'
					);

					const offlineCtx = new OfflineAudioContext(
						1,
						Math.ceil(decodedAudioBuffer.duration * kSampleRate),
						kSampleRate
					);
					const source = offlineCtx.createBufferSource();
					source.buffer = decodedAudioBuffer;
					source.connect(offlineCtx.destination);
					source.start(0);

					log('Starting OfflineAudioContext rendering for resampling...', 'info');
					const renderedBuffer = await offlineCtx.startRendering();
					log(
						`Resampled AudioBuffer: duration ${renderedBuffer.duration.toFixed(2)}s, channels ${renderedBuffer.numberOfChannels}, sampleRate ${renderedBuffer.sampleRate}, length ${renderedBuffer.length}`,
						'info'
					);

					const pcmf32 = renderedBuffer.getChannelData(0);
					log(
						`Recorded audio processed for matching, final PCM F32 samples: ${pcmf32.length}`,
						'info'
					);
					await transcribeAndCompare(pcmf32);
				} catch (e: any) {
					log(`Error processing recorded audio (decode/resample): ${e.message}`, 'error');
					console.error('Audio processing error:', e);
					toast.error(`Audio processing error: ${e.message}`);
					matchStatusMessage = 'Error processing audio.';
					isMatchingInProgress = false;
				}
			};

			mediaRecorderForMatch.onerror = (event: Event) => {
				log(`MediaRecorder error: ${(event as any).error?.name || 'Unknown error'}`, 'error');
				toast.error('Microphone recording error.');
				if (recordInterval) clearInterval(recordInterval);
				recordInterval = null;
				isRecordingAudioForMatch = false;
				isMatchingInProgress = false;
				matchStatusMessage = 'Recording error.';
			};

			mediaRecorderForMatch.start();
			recordStartTime = Date.now();
			matchStatusMessage = `Recording: 0.0s / ${kMaxRecording_s}s`;
			recordInterval = setInterval(() => {
				const elapsed = (Date.now() - recordStartTime) / 1000;
				recordProgress = Math.min(100, (elapsed / kMaxRecording_s) * 100);
				matchStatusMessage = `Recording: ${elapsed.toFixed(1)}s / ${kMaxRecording_s}s`;
				if (elapsed >= kMaxRecording_s) {
					log('Max recording time reached.', 'info');
					stopRecordingForMatch();
				}
			}, 200);

			log('MediaRecorder started.', 'info');
			toast.info('Recording started...');
		} catch (e: any) {
			log(`Error starting recording (getUserMedia or context): ${e.message}`, 'error');
			console.error('getUserMedia error:', e);
			toast.error(`Microphone error: ${e.message}`);
			matchStatusMessage = 'Microphone error.';
			isRecordingAudioForMatch = false;
			isMatchingInProgress = false;
			if (recordInterval) clearInterval(recordInterval);
			recordInterval = null;
		}
	}

	function stopRecordingForMatch() {
		if (recordInterval) {
			clearInterval(recordInterval);
			recordInterval = null;
		}
		if (mediaRecorderForMatch && isRecordingAudioForMatch) {
			log('Stopping MediaRecorder.', 'info');
			isRecordingAudioForMatch = false;
			mediaRecorderForMatch.stop();
			toast.info('Recording stopped. Processing...');
		} else {
			log('Stop recording called but not actively recording or no mediaRecorder.', 'warn');
			isRecordingAudioForMatch = false;
			isMatchingInProgress = false;
			recordProgress = 0;
		}
	}

	async function transcribeAndCompare(audioPCM32: Float32Array) {
		if (!isModelLoaded || !whisperContextId || !whisperModule) {
			log('Whisper model/context not ready for transcription.', 'error');
			toast.error('Whisper not ready.');
			matchStatusMessage = 'Transcription service not ready.';
			isMatchingInProgress = false;
			return;
		}

		if (!audioPCM32 || audioPCM32.length === 0) {
			log('CRITICAL: audioPCM32 is null or empty before transcription!', 'error');
			toast.error('Internal error: No audio data to transcribe.');
			isMatchingInProgress = false;
			return;
		}
		log(
			`Audio for transcription: ${audioPCM32.length} samples. First 5: [${audioPCM32.slice(0, 5).join(', ')}]`,
			'info'
		);
		let hasNaN = false;
		for (let i = 0; i < Math.min(audioPCM32.length, 1000); i++) {
			if (isNaN(audioPCM32[i])) {
				hasNaN = true;
				break;
			}
		}
		if (hasNaN) {
			log('CRITICAL: audioPCM32 contains NaN values!', 'error');
			toast.error('Internal error: Corrupted audio data (NaN).');
			isMatchingInProgress = false;
			return;
		}
		log(
			`Context ID for transcription: ${whisperContextId}, Threads: ${numThreadsForTranscription}, Lang: ${languageForTranscription}`,
			'info'
		);

		matchStatusMessage = 'Transcribing...';
		log(
			`Calling whisperModule.full_default with ${numThreadsForTranscription} threads, lang: ${languageForTranscription}...`
		);

		try {
			if (transcriptionPollInterval) clearInterval(transcriptionPollInterval);

			const ret = whisperModule.full_default(
				whisperContextId,
				audioPCM32,
				languageForTranscription,
				numThreadsForTranscription,
				false
			);

			log(`whisperModule.full_default returned: ${ret}`, 'info');

			if (ret !== 0) {
				throw new Error(`Whisper C API whisper_full_default returned error code: ${ret}`);
			}

			transcriptionPollInterval = setInterval(() => {
				if (!whisperModule) {
					log('WASM Module became unavailable during polling.', 'error');
					clearInterval(transcriptionPollInterval);
					transcriptionPollInterval = null;
					isMatchingInProgress = false;
					matchStatusMessage = 'Transcription failed (module lost).';
					return;
				}
				try {
					if (whisperModule.is_transcription_done(whisperContextId)) {
						clearInterval(transcriptionPollInterval);
						transcriptionPollInterval = null;
						const transcribedText = whisperModule.get_transcription_result(whisperContextId);
						log(`Transcription for match result: "${transcribedText}"`, 'info');
						compareTranscriptionWithLevenshtein(transcribedText);
						isMatchingInProgress = false;
					} else {
						log('Polling: Transcription not done yet...', 'info');
					}
				} catch (pollError: any) {
					log(`Error during transcription polling: ${pollError.message}`, 'error');
					console.error('Polling error:', pollError);
					clearInterval(transcriptionPollInterval);
					transcriptionPollInterval = null;
					toast.error(`Transcription polling error: ${pollError.message}`);
					matchStatusMessage = 'Transcription polling error.';
					isMatchingInProgress = false;
				}
			}, 500);
		} catch (e: any) {
			log(`Error calling/during whisperModule.full_default: ${e.message}`, 'error');
			console.error('Transcription execution error:', e);
			toast.error(`Transcription error: ${e.message}`);
			matchStatusMessage = `Transcription error: ${e.message.split('(')[0]}`;
			isMatchingInProgress = false;
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

		log(`Original (normalized): "${originalNormalized}"`, 'info');
		log(`Transcribed (normalized): "${transcribedNormalized}"`, 'info');

		if (!transcribedNormalized && !originalNormalized) {
			matchStatusMessage = 'Perfect Match! (Both empty) 🎉';
			toast.success('Perfect Match! (Both empty)');
			// Auto-advance on perfect empty match if desired, or handle as special case
			setTimeout(() => {
				if ($practiceStore.isPracticeMode) advanceToNextPracticeItem();
			}, AUTO_ADVANCE_DELAY_MS);
			return;
		}
		if (!transcribedNormalized && originalNormalized) {
			matchStatusMessage = 'No speech detected. Try again. 🙁';
			toast.error('No speech detected.');
			return; // Don't auto-advance if no speech detected for non-empty sentence
		}

		const similarity = calculateSimilarity(originalNormalized, transcribedNormalized);
		log(`Similarity score: ${similarity.toFixed(2)}%`, 'info');

		const perfectThreshold = 95;
		const goodThreshold = 75; // This is our auto-advance threshold
		const partialThreshold = 50;

		let shouldAutoAdvance = false;

		if (similarity >= perfectThreshold) {
			matchStatusMessage = `Perfect Match! (${similarity.toFixed(0)}%) 🎉`;
			toast.success(`Perfect Match! (${similarity.toFixed(0)}%)`);
			shouldAutoAdvance = true;
		} else if (similarity >= goodThreshold) {
			matchStatusMessage = `Good Match! (${similarity.toFixed(0)}%) 👍`;
			toast.info(`Good Match! (${similarity.toFixed(0)}%)`);
			shouldAutoAdvance = true;
		} else if (similarity >= partialThreshold) {
			matchStatusMessage = `Partial Match. (${similarity.toFixed(0)}%) Keep trying!`;
			toast.warning(`Partial Match. (${similarity.toFixed(0)}%)`);
		} else {
			matchStatusMessage = `Needs Improvement. (${similarity.toFixed(0)}%) Try again. 🙁`;
			toast.error(`Needs Improvement. (${similarity.toFixed(0)}%)`);
		}

		if (shouldAutoAdvance) {
			log(`Auto-advancing due to similarity >= ${goodThreshold}%`, 'info');
			setTimeout(() => {
				// Check isPracticeMode again in case user ended practice during the delay
				if ($practiceStore.isPracticeMode) {
					advanceToNextPracticeItem();
				}
			}, AUTO_ADVANCE_DELAY_MS);
		}
	}

	function handleRecordAndMatchClick() {
		if (isRecordingAudioForMatch) {
			stopRecordingForMatch();
		} else {
			startRecordingForMatch();
		}
	}

	onDestroy(() => {
		log('PracticeDisplay onDestroy.', 'info');
		if (recordInterval) {
			clearInterval(recordInterval);
			recordInterval = null;
		}
		if (transcriptionPollInterval) {
			clearInterval(transcriptionPollInterval);
			transcriptionPollInterval = null;
		}
		if (mediaRecorderForMatch && mediaRecorderForMatch.state !== 'inactive') {
			log('Stopping active MediaRecorder on destroy.', 'warn');
			mediaRecorderForMatch.stop();
		}
		mediaRecorderForMatch?.stream?.getTracks().forEach((track) => track.stop());
		if (audioContextForMatch && audioContextForMatch.state !== 'closed') {
			log('Closing AudioContext on destroy.', 'info');
			audioContextForMatch
				.close()
				.catch((e) => log(`Error closing AudioContext: ${e.message}`, 'error'));
		}
	});
</script>

<div class="flex w-full max-w-2xl flex-col items-center">
	<h1 class="mb-4 text-center text-3xl font-bold">Practice Mode</h1>
	{#if $practiceStore.sentences.length > 0 && $practiceStore.currentSentenceIndex >= 0}
		<FullParagraphDisplay />
	{/if}

	<Card class="my-6 w-full p-4">
		<CardHeader>
			<CardTitle class="text-muted-foreground text-center text-lg">
				{displayTitleText}
			</CardTitle>
		</CardHeader>
		<CardContent>
			<p
				class="text-primary flex min-h-[2em] items-center justify-center text-center text-5xl leading-tight font-extrabold"
			>
				{displayItemText || '...'}
			</p>
		</CardContent>
	</Card>

	{#if $practiceStore.isPracticeMode && displayItemText && displayItemText !== '...'}
		<div class="mt-4 flex space-x-4">
			<Button
				onclick={handleNextSentence}
				size="lg"
				disabled={isMatchingInProgress || isRecordingAudioForMatch}
			>
				Next Sentence
			</Button>
			<Button
				onclick={handleRecordAndMatchClick}
				size="lg"
				variant={isRecordingAudioForMatch ? 'destructive' : 'outline'}
				disabled={!isModelLoaded ||
					!whisperContextId ||
					(isMatchingInProgress && !isRecordingAudioForMatch)}
				title={!isModelLoaded || !whisperContextId
					? 'Whisper model not ready'
					: isRecordingAudioForMatch
						? 'Stop Recording'
						: 'Record & Match'}
			>
				{#if isRecordingAudioForMatch}
					<StopCircleIcon class="mr-2 h-5 w-5" />
					Stop Recording
				{:else if isMatchingInProgress}
					<LoaderCircleIcon class="mr-2 h-5 w-5 animate-spin" />
					Processing...
				{:else}
					<MicIcon class="mr-2 h-5 w-5" />
					Record & Match
				{/if}
			</Button>
		</div>
		{#if isRecordingAudioForMatch || (recordProgress > 0 && recordProgress < 100 && isMatchingInProgress)}
			<div class="mt-3 w-full max-w-xs">
				<Progress value={recordProgress} class="w-full" />
				<p class="text-muted-foreground mt-1 text-center text-sm">{matchStatusMessage}</p>
			</div>
		{/if}
	{:else if $practiceStore.isPracticeMode && (!isModelLoaded || !whisperContextId)}
		<p class="text-muted-foreground mt-4 text-center text-lg">
			Waiting for Whisper model to load before enabling recording...
		</p>
	{/if}

	{#if matchStatusMessage && !(isRecordingAudioForMatch || (recordProgress > 0 && recordProgress < 100 && isMatchingInProgress))}
		<p class="mt-4 text-center text-lg">{matchStatusMessage}</p>
	{/if}

	{#if $practiceStore.sentences.length > 0}
		<p class="text-muted-foreground mt-4 text-sm">
			{#if $practiceStore.isPracticeMode && currentItem}
				Sentence {$practiceStore.currentSentenceIndex + 1}/{$practiceStore.sentences.length}
			{:else if !$practiceStore.isPracticeMode && $practiceStore.sentences.length > 0}
				Practice complete or ended.
			{/if}
		</p>
	{/if}
</div>
	