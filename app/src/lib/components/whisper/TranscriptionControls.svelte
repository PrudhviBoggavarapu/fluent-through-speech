<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { languages } from '$lib/constants';
	import {
		cardClasses,
		cardHeaderClasses,
		cardTitleClasses,
		cardContentClasses,
		cardFooterClasses,
		labelClasses,
		selectClasses,
		primaryButtonClasses,
		outlineButtonClasses,
		textareaClasses
	} from '$lib/uiClasses';

	export let whisperModule: any;
	export let whisperContextId: number | null;
	export let audioBuffer: Float32Array | null;
	export let isModelLoaded: boolean;
	export let isAudioLoaded: boolean;

	export let initialSelectedLanguage = 'en';
	export let initialNumThreads = Math.min(
		16,
		Math.max(1, Math.floor((navigator.hardwareConcurrency || 4) / 2))
	);

	// Internal state
	let selectedLanguage = initialSelectedLanguage;
	let numThreads = initialNumThreads;
	let isTranscribing = false;
	let currentTaskIsTranslate = false; // To differentiate between transcribe/translate for button state
	let internalTranscriptionResult = '';
	let transcriptionPollInterval: any;

	const dispatch = createEventDispatcher<{
		log: { text: string; type?: 'info' | 'error' | 'warn' };
		notify: { type: 'success' | 'error' | 'info' | 'warning'; message: string };
		transcriptionComplete: { result: string };
	}>();

	function log(text: string, type: 'info' | 'error' | 'warn' = 'info') {
		dispatch('log', { text, type });
	}

	function processAudio(translate: boolean) {
		if (!isModelLoaded || !audioBuffer || !whisperContextId || !whisperModule) {
			log('Model not loaded, audio not ready, or WASM error.', 'error');
			dispatch('notify', {
				type: 'error',
				message: 'Cannot transcribe: Model or audio not ready.'
			});
			return;
		}

		isTranscribing = true;
		currentTaskIsTranslate = translate;
		internalTranscriptionResult = ''; // Clear previous result
		const task = translate ? 'Translating' : 'Transcribing';
		log(`${task} audio with ${numThreads} threads, language: ${selectedLanguage}...`);
		dispatch('notify', { type: 'info', message: `${task} in progress...` });

		try {
			const ret = whisperModule.full_default(
				whisperContextId,
				audioBuffer,
				selectedLanguage,
				numThreads,
				translate
			);

			if (ret !== 0) {
				throw new Error(`whisper_full_default returned error code: ${ret}`);
			}

			transcriptionPollInterval = setInterval(() => {
				if (whisperModule.is_transcription_done()) {
					clearInterval(transcriptionPollInterval);
					const resultText = whisperModule.get_transcription_result();
					internalTranscriptionResult = resultText;
					log(`${task} finished.`);
					log('--- Transcription Result ---');
					log(resultText || '(No text transcribed)');
					log('--------------------------');
					isTranscribing = false;
					dispatch('notify', { type: 'success', message: `${task} complete!` });
					dispatch('transcriptionComplete', { result: resultText });
				} else {
					// Optional: log(`${task} in progress... (polling)`);
				}
			}, 500);
		} catch (e: any) {
			log(`Error during transcription: ${e.message}`, 'error');
			console.error('Transcription error:', e);
			isTranscribing = false;
			dispatch('notify', { type: 'error', message: `Transcription error: ${e.message}` });
			if (transcriptionPollInterval) clearInterval(transcriptionPollInterval);
		}
	}

	onDestroy(() => {
		if (transcriptionPollInterval) clearInterval(transcriptionPollInterval);
	});

	// Reset transcription result if audio changes
	$: if (audioBuffer && internalTranscriptionResult) {
		internalTranscriptionResult = '';
	}
</script>

<div class={cardClasses}>
	<div class={cardHeaderClasses}>
		<h2 class={cardTitleClasses}>Step 3: Transcribe Audio</h2>
	</div>
	<div class={cardContentClasses}>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div>
				<label for="language-select" class={labelClasses}>Language:</label>
				<select
					id="language-select"
					bind:value={selectedLanguage}
					class="{selectClasses} mt-1 w-full"
					disabled={isTranscribing || !isAudioLoaded || !isModelLoaded}
				>
					{#each languages as lang}
						<option value={lang.value}>{lang.label}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="threads-input" class={labelClasses}>Threads: {numThreads}</label>
				<input
					type="range"
					id="threads-input"
					min="1"
					max="16"
					bind:value={numThreads}
					class="accent-primary mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
					disabled={isTranscribing || !isAudioLoaded || !isModelLoaded}
				/>
			</div>
		</div>
		<div class="mt-4 flex space-x-2">
			<button
				on:click={() => processAudio(false)}
				class={primaryButtonClasses}
				disabled={isTranscribing || !isAudioLoaded || !isModelLoaded}
			>
				{#if isTranscribing && !currentTaskIsTranslate}
					<div
						class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
					></div>
					Transcribing...
				{:else}
					Transcribe
				{/if}
			</button>
			<button
				on:click={() => processAudio(true)}
				class={outlineButtonClasses}
				disabled={isTranscribing || !isAudioLoaded || !isModelLoaded}
			>
				{#if isTranscribing && currentTaskIsTranslate}
					<div
						class="border-primary mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
					></div>
					Translating...
				{:else}
					Translate to English
				{/if}
			</button>
		</div>
	</div>
	{#if internalTranscriptionResult}
		<div class="{cardFooterClasses} border-border mt-4 border-t">
			<h3 class="text-lg font-semibold">Transcription Result:</h3>
			<textarea
				class="{textareaClasses} h-48 font-mono"
				readonly
				value={internalTranscriptionResult}
				placeholder="Transcription will appear here..."
			></textarea>
		</div>
	{/if}
</div>
