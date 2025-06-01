<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { kSampleRate, kMaxAudio_s, kMaxRecording_s } from '$lib/constants';
	import {
		cardClasses,
		cardHeaderClasses,
		cardTitleClasses,
		cardDescriptionClasses,
		cardContentClasses,
		labelClasses,
		inputClasses,
		primaryButtonClasses,
		destructiveButtonClasses,
		svelteProgressClasses
	} from '$lib/uiClasses';

	export let isModelLoaded: boolean; // To enable/disable inputs
	export let initialAudioStatus = 'No audio loaded.';

	// Internal state
	let inputMethod: 'file' | 'mic' = 'file';
	let audioFile: File | null = null;
	let internalIsAudioLoaded = false;
	let internalAudioStatus = initialAudioStatus;
	let isRecording = false;
	let recordProgress = 0;
	let recordStartTime = 0;
	let mediaRecorder: MediaRecorder | null = null;
	let audioChunks: Blob[] = [];
	let recordInterval: any;
	let audioContext: AudioContext | null = null;

	const dispatch = createEventDispatcher<{
		log: { text: string; type?: 'info' | 'error' | 'warn' };
		notify: { type: 'success' | 'error' | 'info' | 'warning'; message: string };
		audioReady: { buffer: Float32Array; fileName?: string };
		audioCleared: void;
		statusUpdate: string;
	}>();

	function log(text: string, type: 'info' | 'error' | 'warn' = 'info') {
		dispatch('log', { text, type });
	}

	function getAudioContext(): AudioContext {
		if (!audioContext) {
			audioContext = new AudioContext({
				sampleRate: kSampleRate,
				channelCount: 1
			} as AudioContextOptions); // Cast to bypass potential TS lib mismatch
		}
		return audioContext;
	}

	async function handleAudioFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		audioFile = file;
		internalAudioStatus = `Loading audio file: ${file.name}...`;
		dispatch('statusUpdate', internalAudioStatus);
		log(`Loading audio: ${file.name}, size: ${file.size} bytes`);
		internalIsAudioLoaded = false; // Reset while loading new file
		dispatch('audioCleared');

		try {
			const arrayBuffer = await file.arrayBuffer();
			const ctx = getAudioContext();
			const decodedAudioBuffer = await ctx.decodeAudioData(arrayBuffer);

			const offlineCtx = new OfflineAudioContext(
				1,
				decodedAudioBuffer.duration * kSampleRate,
				kSampleRate
			);
			const source = offlineCtx.createBufferSource();
			source.buffer = decodedAudioBuffer;
			source.connect(offlineCtx.destination);
			source.start(0);

			const renderedBuffer = await offlineCtx.startRendering();
			let pcmf32 = renderedBuffer.getChannelData(0);

			if (pcmf32.length > kMaxAudio_s * kSampleRate) {
				pcmf32 = pcmf32.slice(0, kMaxAudio_s * kSampleRate);
				log(`Audio truncated to first ${kMaxAudio_s} seconds.`);
				internalAudioStatus = `Audio loaded (truncated): ${file.name}`;
			} else {
				internalAudioStatus = `Audio loaded: ${file.name}`;
			}
			dispatch('statusUpdate', internalAudioStatus);
			internalIsAudioLoaded = true;
			log(`Audio processed, samples: ${pcmf32.length}`);
			dispatch('notify', { type: 'success', message: `Audio "${file.name}" loaded.` });
			dispatch('audioReady', { buffer: pcmf32, fileName: file.name });
		} catch (e: any) {
			log(`Error processing audio file: ${e.message}`, 'error');
			internalAudioStatus = `Error loading audio: ${e.message}`;
			dispatch('statusUpdate', internalAudioStatus);
			internalIsAudioLoaded = false;
			dispatch('notify', { type: 'error', message: `Error loading audio: ${e.message}` });
			dispatch('audioCleared');
		}
	}

	async function startRecording() {
		if (isRecording) return;
		isRecording = true;
		recordProgress = 0;
		audioChunks = [];
		internalAudioStatus = 'Recording...';
		dispatch('statusUpdate', internalAudioStatus);
		log('Starting microphone recording...');
		internalIsAudioLoaded = false; // Reset while recording
		dispatch('audioCleared');

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
			const ctx = getAudioContext();
			if (ctx.state === 'suspended') {
				await ctx.resume();
			}

			mediaRecorder = new MediaRecorder(stream);
			mediaRecorder.ondataavailable = (event) => {
				audioChunks.push(event.data);
			};

			mediaRecorder.onstop = async () => {
				isRecording = false; // Should be set before async operations
				clearInterval(recordInterval);
				stream.getTracks().forEach((track) => track.stop());
				internalAudioStatus = 'Processing recorded audio...';
				dispatch('statusUpdate', internalAudioStatus);
				log('Recording stopped. Processing...');

				if (audioChunks.length === 0) {
					log('No audio data recorded.', 'warn');
					internalAudioStatus = 'No audio data recorded.';
					dispatch('statusUpdate', internalAudioStatus);
					dispatch('notify', { type: 'warning', message: 'No audio data recorded.' });
					return;
				}

				// Ensure mediaRecorder is not null before accessing mimeType
				const mimeType = mediaRecorder?.mimeType || 'audio/webm'; // Default if somehow null
				const audioBlob = new Blob(audioChunks, { type: mimeType });
				audioChunks = []; // Clear chunks after creating blob

				const arrayBuffer = await audioBlob.arrayBuffer();
				const decodedAudioBuffer = await ctx.decodeAudioData(arrayBuffer);

				const offlineCtx = new OfflineAudioContext(
					1,
					decodedAudioBuffer.duration * kSampleRate,
					kSampleRate
				);
				const source = offlineCtx.createBufferSource();
				source.buffer = decodedAudioBuffer;
				source.connect(offlineCtx.destination);
				source.start(0);

				const renderedBuffer = await offlineCtx.startRendering();
				const pcmf32 = renderedBuffer.getChannelData(0);

				internalIsAudioLoaded = true;
				const duration = (pcmf32.length / kSampleRate).toFixed(1);
				internalAudioStatus = `Audio recorded (${duration}s).`;
				dispatch('statusUpdate', internalAudioStatus);
				log(`Recorded audio processed, samples: ${pcmf32.length}`);
				dispatch('notify', { type: 'success', message: 'Recording finished and processed.' });
				dispatch('audioReady', { buffer: pcmf32, fileName: `recording-${Date.now()}.wav` });
			};

			mediaRecorder.start();
			recordStartTime = Date.now();
			recordInterval = setInterval(() => {
				const elapsed = (Date.now() - recordStartTime) / 1000;
				recordProgress = Math.min(100, (elapsed / kMaxRecording_s) * 100);
				internalAudioStatus = `Recording: ${elapsed.toFixed(1)}s / ${kMaxRecording_s}s`;
				dispatch('statusUpdate', internalAudioStatus);
				if (elapsed >= kMaxRecording_s) {
					stopRecording();
				}
			}, 200);
		} catch (e: any) {
			log(`Error starting recording: ${e.message}`, 'error');
			internalAudioStatus = `Mic error: ${e.message}`;
			dispatch('statusUpdate', internalAudioStatus);
			isRecording = false;
			dispatch('notify', { type: 'error', message: `Microphone error: ${e.message}` });
		}
	}

	function stopRecording() {
		if (mediaRecorder && isRecording) {
			// Check isRecording before calling stop
			mediaRecorder.stop();
			// onstop will handle the rest
		} else {
			// If not recording or mediaRecorder is null, ensure state is clean
			isRecording = false;
			clearInterval(recordInterval);
			if (internalAudioStatus.startsWith('Recording:')) {
				internalAudioStatus = 'Recording stopped prematurely.';
				dispatch('statusUpdate', internalAudioStatus);
			}
		}
	}

	onDestroy(() => {
		if (recordInterval) clearInterval(recordInterval);
		if (mediaRecorder && mediaRecorder.state !== 'inactive') {
			mediaRecorder.stop();
		}
		mediaRecorder?.stream?.getTracks().forEach((track) => track.stop());
		if (audioContext && audioContext.state !== 'closed') {
			audioContext.close();
		}
	});

	// When input method changes, reset audio loaded state
	$: if (inputMethod) {
		internalIsAudioLoaded = false;
		internalAudioStatus = initialAudioStatus;
		// dispatch('audioCleared'); // App.svelte will handle this based on currentStep
	}
</script>

<div class={cardClasses}>
	<div class={cardHeaderClasses}>
		<h2 class={cardTitleClasses}>Step 2: Provide Audio</h2>
		<p class="{cardDescriptionClasses} mt-1">{internalAudioStatus}</p>
	</div>
	<div class={cardContentClasses}>
		<div class="flex items-center space-x-4">
			<span class={labelClasses}>Input method:</span>
			<div class="flex items-center space-x-2">
				<input
					type="radio"
					id="input-file"
					name="input-method"
					value="file"
					bind:group={inputMethod}
					disabled={!isModelLoaded || isRecording}
					class="text-primary focus:ring-primary h-4 w-4 border-gray-300"
				/>
				<label for="input-file" class={labelClasses}>File Upload</label>
			</div>
			<div class="flex items-center space-x-2">
				<input
					type="radio"
					id="input-mic"
					name="input-method"
					value="mic"
					bind:group={inputMethod}
					disabled={!isModelLoaded || isRecording}
					class="text-primary focus:ring-primary h-4 w-4 border-gray-300"
				/>
				<label for="input-mic" class={labelClasses}>Microphone</label>
			</div>
		</div>

		{#if inputMethod === 'file'}
			<div class="mt-2">
				<label for="audio-file-upload" class={labelClasses}>
					Select an audio file (e.g., .wav, .mp3):
				</label>
				<input
					type="file"
					id="audio-file-upload"
					accept="audio/*"
					class="{inputClasses} mt-1"
					on:change={handleAudioFileSelect}
					disabled={!isModelLoaded || isRecording}
				/>
			</div>
		{:else if inputMethod === 'mic'}
			<div class="mt-2 space-y-2">
				{#if !isRecording}
					<button
						on:click={startRecording}
						class={primaryButtonClasses}
						disabled={!isModelLoaded || isRecording}
					>
						Start Recording
					</button>
				{:else}
					<button
						on:click={stopRecording}
						class={destructiveButtonClasses}
						disabled={!isModelLoaded}
					>
						Stop Recording
					</button>
				{/if}
				{#if isRecording || (recordProgress > 0 && recordProgress < 100)}
					<progress value={recordProgress} max="100" class="{svelteProgressClasses} mt-2"
					></progress>
					<p class="text-muted-foreground text-sm">{internalAudioStatus}</p>
				{/if}
			</div>
		{/if}

		{#if internalIsAudioLoaded}
			<p class="mt-2 text-green-600">Audio is ready for transcription.</p>
		{/if}
	</div>
</div>
