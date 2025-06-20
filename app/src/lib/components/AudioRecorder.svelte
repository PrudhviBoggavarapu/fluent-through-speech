<!-- src/lib/components/AudioRecorder.svelte -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Progress } from '$lib/components/ui/progress';
	import MicIcon from '@lucide/svelte/icons/mic';
	import StopCircleIcon from '@lucide/svelte/icons/stop-circle';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';

	let {
		maxRecordingSeconds,
		targetSampleRate,
		disabled = false // External disabled state
	}: {
		maxRecordingSeconds: number;
		targetSampleRate: number;
		disabled?: boolean;
	} = $props();

	const dispatch = createEventDispatcher<{
		processed: { pcmf32: Float32Array };
		status: {
			message: string;
			type: 'recording' | 'processing' | 'error' | 'info' | 'idle';
			isRecording?: boolean;
			isProcessing?: boolean;
			progress?: number;
		};
		log: { text: string; type?: 'info' | 'error' | 'warn' };
		error: { message: string; details?: any };
	}>();

	let actualIsRecording = $state(false);
	let isProcessingAudio = $state(false);
	let recordProgress = $state(0);
	let currentStatusMessage = $state('');

	let mediaRecorder: MediaRecorder | null = null;
	let audioChunks: Blob[] = [];
	let audioContext: AudioContext | null = null;
	let recordStartTime = 0;
	let recordInterval: any = null;

	const _derivedIsRecording = $derived(actualIsRecording);
	const _derivedIsProcessing = $derived(isProcessingAudio);

	// Combined disabled state for the button
	let isButtonDisabled = $derived(disabled || (!actualIsRecording && isProcessingAudio));

	function log(text: string, type: 'info' | 'error' | 'warn' = 'info') {
		console[type](`[AudioRecorder] ${text}`);
		dispatch('log', { text: `[AudioRecorder] ${text}`, type });
	}

	function getAudioContext(): AudioContext {
		if (!audioContext || audioContext.state === 'closed') {
			log('Creating new AudioContext.', 'info');
			audioContext = new AudioContext({
				sampleRate: targetSampleRate,
				channelCount: 1
			} as AudioContextOptions);
		}
		return audioContext;
	}

	export function start() {
		if (actualIsRecording || isProcessingAudio) {
			log('Already recording or processing.', 'warn');
			return;
		}
		actualIsRecording = true;
		isProcessingAudio = false;
		recordProgress = 0;
		audioChunks = [];
		currentStatusMessage = `Initializing...`;
		dispatch('status', {
			message: currentStatusMessage,
			type: 'recording',
			isRecording: true,
			isProcessing: false,
			progress: 0
		});
		log('Starting microphone recording...');

		navigator.mediaDevices
			.getUserMedia({ audio: true, video: false })
			.then(async (stream) => {
				const ctx = getAudioContext();
				if (ctx.state === 'suspended') {
					log('AudioContext was suspended, resuming.', 'info');
					await ctx.resume();
				}

				mediaRecorder = new MediaRecorder(stream);
				mediaRecorder.ondataavailable = (event) => {
					if (event.data.size > 0) {
						audioChunks.push(event.data);
					}
				};

				mediaRecorder.onstop = async () => {
					stream.getTracks().forEach((track) => track.stop());
					if (recordInterval) clearInterval(recordInterval);
					recordInterval = null;
					actualIsRecording = false;
					isProcessingAudio = true;
					currentStatusMessage = 'Processing audio...';
					dispatch('status', {
						message: currentStatusMessage,
						type: 'processing',
						isRecording: false,
						isProcessing: true,
						progress: recordProgress
					});
					log('Recording stopped. Processing audio...');

					if (audioChunks.length === 0) {
						log('No audio data recorded.', 'warn');
						toast.warning('No audio data recorded.');
						currentStatusMessage = 'No audio recorded. Try again.';
						dispatch('status', {
							message: currentStatusMessage,
							type: 'error',
							isRecording: false,
							isProcessing: false
						});
						isProcessingAudio = false;
						return;
					}

					const mimeType = mediaRecorder?.mimeType || 'audio/webm';
					const audioBlob = new Blob(audioChunks, { type: mimeType });
					audioChunks = [];

					try {
						const arrayBuffer = await audioBlob.arrayBuffer();
						const decodedAudioBuffer = await ctx.decodeAudioData(arrayBuffer);

						const offlineCtx = new OfflineAudioContext(
							1,
							Math.ceil(decodedAudioBuffer.duration * targetSampleRate),
							targetSampleRate
						);
						const source = offlineCtx.createBufferSource();
						source.buffer = decodedAudioBuffer;
						source.connect(offlineCtx.destination);
						source.start(0);

						const renderedBuffer = await offlineCtx.startRendering();
						const pcmf32 = renderedBuffer.getChannelData(0);
						log(`Audio processed, final PCM F32 samples: ${pcmf32.length}`, 'info');
						dispatch('processed', { pcmf32 });
						currentStatusMessage = 'Audio processed.';
						dispatch('status', {
							message: currentStatusMessage,
							type: 'info',
							isRecording: false,
							isProcessing: false
						});
					} catch (e: any) {
						log(`Error processing recorded audio: ${e.message}`, 'error');
						toast.error(`Audio processing error: ${e.message}`);
						currentStatusMessage = 'Error processing audio.';
						dispatch('status', {
							message: currentStatusMessage,
							type: 'error',
							isRecording: false,
							isProcessing: false
						});
						dispatch('error', {
							message: `Audio processing error: ${e.message}`,
							details: e
						});
					} finally {
						isProcessingAudio = false;
					}
				};

				mediaRecorder.onerror = (event: Event) => {
					log(`MediaRecorder error: ${(event as any).error?.name || 'Unknown error'}`, 'error');
					toast.error('Microphone recording error.');
					if (recordInterval) clearInterval(recordInterval);
					recordInterval = null;
					actualIsRecording = false;
					isProcessingAudio = false;
					currentStatusMessage = 'Recording error.';
					dispatch('status', {
						message: currentStatusMessage,
						type: 'error',
						isRecording: false,
						isProcessing: false
					});
					dispatch('error', {
						message: 'Microphone recording error.'
					});
				};

				mediaRecorder.start();
				recordStartTime = Date.now();
				currentStatusMessage = `Recording: 0.0s / ${maxRecordingSeconds}s`;
				dispatch('status', {
					message: currentStatusMessage,
					type: 'recording',
					isRecording: true,
					isProcessing: false,
					progress: 0
				});

				recordInterval = setInterval(() => {
					const elapsed = (Date.now() - recordStartTime) / 1000;
					recordProgress = Math.min(100, (elapsed / maxRecordingSeconds) * 100);
					currentStatusMessage = `Recording: ${elapsed.toFixed(1)}s / ${maxRecordingSeconds}s`;
					dispatch('status', {
						message: currentStatusMessage,
						type: 'recording',
						isRecording: true,
						isProcessing: false,
						progress: recordProgress
					});
					if (elapsed >= maxRecordingSeconds) {
						log('Max recording time reached.', 'info');
						stop();
					}
				}, 200);

				log('MediaRecorder started.', 'info');
				toast.info('Recording started...');
			})
			.catch((e: any) => {
				log(`Error starting recording: ${e.message}`, 'error');
				toast.error(`Microphone error: ${e.message}`);
				currentStatusMessage = 'Microphone error.';
				dispatch('status', {
					message: currentStatusMessage,
					type: 'error',
					isRecording: false,
					isProcessing: false
				});
				dispatch('error', {
					message: `Microphone error: ${e.message}`,
					details: e
				});
				actualIsRecording = false;
				isProcessingAudio = false;
				if (recordInterval) clearInterval(recordInterval);
				recordInterval = null;
			});
	}

	export function stop() {
		if (recordInterval) {
			clearInterval(recordInterval);
			recordInterval = null;
		}
		if (mediaRecorder && actualIsRecording) {
			log('Stopping MediaRecorder.', 'info');
			mediaRecorder.stop();
			// toast.info('Recording stopped. Processing...'); // Moved to onstop for accuracy
		} else {
			log('Stop called but not actively recording or no mediaRecorder.', 'warn');
			actualIsRecording = false; // Ensure state is reset if stop is called unexpectedly
			isProcessingAudio = false;
			recordProgress = 0;
			currentStatusMessage = 'Idle';
			dispatch('status', {
				message: 'Idle',
				type: 'idle',
				isRecording: false,
				isProcessing: false,
				progress: 0
			});
		}
	}

	export function isRecording(): boolean {
		return _derivedIsRecording;
	}

	export function isProcessing(): boolean {
		return _derivedIsProcessing;
	}

	function handleClick() {
		if (actualIsRecording) {
			stop();
		} else {
			start();
		}
	}

	onDestroy(() => {
		log('AudioRecorder onDestroy.', 'info');
		if (recordInterval) clearInterval(recordInterval);
		if (mediaRecorder && mediaRecorder.state !== 'inactive') {
			log('Stopping active MediaRecorder on destroy.', 'warn');
			mediaRecorder.stop();
		}
		mediaRecorder?.stream?.getTracks().forEach((track) => track.stop());
		if (audioContext && audioContext.state !== 'closed') {
			log('Closing AudioContext on destroy.', 'info');
			audioContext.close().catch((e) => log(`Error closing AudioContext: ${e.message}`, 'error'));
		}
	});

	let buttonClass = $derived('');
	$effect(() => {
		if (isButtonDisabled) {
			buttonClass = 'bg-slate-700 text-slate-500 opacity-60 cursor-not-allowed';
		} else if (actualIsRecording) {
			buttonClass =
				'bg-rose-500 text-slate-100 hover:bg-rose-600 active:bg-rose-700 focus-visible:ring-rose-500';
		} else if (isProcessingAudio) {
			buttonClass = 'bg-blue-500 text-slate-100 cursor-wait';
		} else {
			buttonClass =
				'bg-slate-700 text-slate-100 border border-slate-600 hover:bg-purple-500/40 hover:text-purple-100 focus-visible:ring-purple-500';
		}
	});
</script>

<div class="flex w-full flex-col items-center">
	<Button
		onclick={handleClick}
		size="lg"
		class="{buttonClass} focus-visible:ring-offset-slate-900"
		disabled={isButtonDisabled}
		title={disabled
			? 'Recorder disabled by parent'
			: actualIsRecording
				? 'Stop Recording'
				: isProcessingAudio
					? 'Processing...'
					: 'Start Recording'}
	>
		{#if actualIsRecording}
			<StopCircleIcon class="mr-2 h-5 w-5 text-slate-100" />
			Stop
		{:else if isProcessingAudio}
			<LoaderCircleIcon class="mr-2 h-5 w-5 animate-spin text-slate-100" />
			Processing
		{:else}
			<MicIcon class="mr-2 h-5 w-5 text-purple-300" />
			Record
		{/if}
	</Button>
	{#if actualIsRecording || (isProcessingAudio && recordProgress > 0)}
		<div class="mt-3 w-full max-w-xs">
			<Progress
				value={recordProgress}
				class="w-full [&::-moz-progress-bar]:bg-purple-500 [&::-webkit-progress-bar]:bg-slate-700 [&::-webkit-progress-value]:bg-purple-500"
			/>
			{#if currentStatusMessage}
				<p class="mt-1 text-center text-sm text-slate-400">
					{currentStatusMessage}
				</p>
			{/if}
		</div>
	{/if}
</div>
