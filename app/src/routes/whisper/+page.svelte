<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Toaster, toast } from 'svelte-sonner';

	// Adjusted import paths for SvelteKit structure
	import ModelLoader from '$lib/components/whisper/ModelLoader.svelte';
	import AudioInput from '$lib/components/whisper/AudioInput.svelte';
	import TranscriptionControls from '$lib/components/whisper/TranscriptionControls.svelte';
	import LogViewer from '$lib/components/whisper/LogViewer.svelte';
	import {
		DEFAULT_MODEL_NAME, // kSampleRate, kMaxAudio_s, kMaxRecording_s are used internally by components
		languages as langOptions // Renamed to avoid conflict if any
	} from '$lib/constants'; // Assuming constants.ts is in src/lib

	// --- State Variables ---
	let currentStep: 1 | 2 | 3 = 1;
	let logOutput = 'Welcome to Whisper WASM Svelte!\n';
	// transcriptionResult is now managed within TranscriptionControls and emitted
	// If App needs it directly, TranscriptionControls would emit it.
	// For now, TranscriptionControls displays its own result.

	// Step 1: Model Loading related state
	let appModelStatus = 'No model loaded.';
	let selectedModelName = '';
	let isModelLoaded = false;
	let whisperContextId: number | null = null;

	// Step 2: Audio Input related state
	let appAudioStatus = 'No audio loaded.';
	let audioBuffer: Float32Array | null = null;
	let isAudioLoaded = false;

	// WASM Module related
	let whisperModule: any = null;
	let isWasmReady = false;
	let isWasmLoading = true;

	// --- Helper Functions ---
	function printToLog(text: string, type: 'info' | 'error' | 'warn' = 'info') {
		const prefix = type === 'error' ? 'ERROR: ' : type === 'warn' ? 'WARN: ' : '';
		logOutput += `${prefix}${text}\n`;
	}

	// --- Lifecycle: onMount ---
	onMount(async () => {
		printToLog('App component mounted. Initializing Whisper WASM...');

		if ('serviceWorker' in navigator) {
			try {
				// Ensure your coi-serviceworker.min.js is in the static folder
				await navigator.serviceWorker.register('/coi-serviceworker.min.js', { scope: '/' });
				printToLog('COI Service Worker registered successfully with scope: /');
			} catch (e) {
				printToLog(
					`COI Service Worker registration failed: ${e}. Transcription may not work.`,
					'error'
				);
				console.error('COI Service Worker registration failed:', e);
				isWasmLoading = false;
				isWasmReady = false;
				return;
			}
		} else {
			printToLog('Service Workers not supported in this browser.', 'warn');
		}

		try {
			const helpersScript = document.createElement('script');
			// Ensure helpers.js is in static/whisper.wasm/
			helpersScript.src = '/whisper.wasm/helpers.js';
			helpersScript.onload = () => {
				printToLog('helpers.js loaded.');
				if (typeof (window as any).loadRemote !== 'function') {
					printToLog(
						'loadRemote function not found. Model fetching via buttons might fail.',
						'warn'
					);
				}
				loadMainJs();
			};
			helpersScript.onerror = () => {
				printToLog('Failed to load helpers.js.', 'error');
				isWasmLoading = false;
				isWasmReady = false;
			};
			document.head.appendChild(helpersScript);
		} catch (e) {
			printToLog(`Error setting up helpers.js: ${e}`, 'error');
			isWasmLoading = false;
			isWasmReady = false;
		}
	});

	function loadMainJs() {
		(window as any).Module = {
			print: (text: string) => printToLog(`WASM: ${text}`),
			printErr: (text: string) => printToLog(`WASM_ERR: ${text}`, 'error'),
			setStatus: (text: string) => {
				if (!text && isWasmReady && !isModelLoaded && currentStep === 1) return;
				printToLog(`WASM_STATUS: ${text}`);
			},
			monitorRunDependencies: (left: number) => {},
			onRuntimeInitialized: async () => {
				printToLog('Whisper WASM Runtime Initialized!');
				isWasmReady = true;
				isWasmLoading = false;
				whisperModule = (window as any).Module;
				appModelStatus = 'WASM Runtime Ready. Auto-loading default model...';
				toast.success('Whisper WASM engine ready!');
				// ModelLoader component will handle its auto-load logic
			},
			locateFile: (path: string, prefix: string) => {
				// Ensure whisper.wasm is in the static/whisper.wasm/ directory
				// Or adjust path if it's directly in /static
				if (path.endsWith('.wasm')) {
					return '/whisper.wasm'; // Or '/whisper.wasm/whisper.wasm' if nested
				}
				return prefix + path;
			}
		};

		try {
			const mainScript = document.createElement('script');
			// Ensure libmain.js is in the static folder
			mainScript.src = '/libmain.js';
			mainScript.async = true;
			mainScript.onload = () => {
				printToLog('libmain.js script tag loaded. Waiting for runtime initialization...');
			};
			mainScript.onerror = () => {
				printToLog('Failed to load libmain.js.', 'error');
				isWasmLoading = false;
				isWasmReady = false;
				appModelStatus = 'Error loading WASM module.';
				toast.error('Failed to load Whisper WASM module.');
			};
			document.head.appendChild(mainScript);
		} catch (e) {
			printToLog(`Error loading libmain.js: ${e}`, 'error');
			isWasmLoading = false;
			isWasmReady = false;
			appModelStatus = 'Error loading WASM module.';
			toast.error('Failed to load Whisper WASM module.');
		}
	}

	// --- Event Handlers from Child Components ---
	function handleLogFromChild(
		event: CustomEvent<{ text: string; type?: 'info' | 'error' | 'warn' }>
	) {
		printToLog(event.detail.text, event.detail.type);
	}

	function handleNotifyFromChild(
		event: CustomEvent<{ type: 'success' | 'error' | 'info' | 'warning'; message: string }>
	) {
		toast[event.detail.type](event.detail.message);
	}

	function handleModelInitialized(event: CustomEvent<{ contextId: number; modelName: string }>) {
		whisperContextId = event.detail.contextId;
		selectedModelName = event.detail.modelName;
		isModelLoaded = true;
		// appModelStatus is updated by ModelLoader's statusUpdate event
		currentStep = 2;
		isAudioLoaded = false;
		audioBuffer = null;
		appAudioStatus = 'No audio loaded.';
		// transcriptionResult = ''; // Managed by TranscriptionControls
	}

	function handleModelUnloaded() {
		if (whisperModule && whisperContextId) {
			try {
				whisperModule.free(whisperContextId);
				printToLog(`Freed context ${whisperContextId} due to model change.`);
			} catch (e) {
				printToLog(`Error freeing context ${whisperContextId}: ${e}`, 'error');
			}
		}
		whisperContextId = null;
		isModelLoaded = false;
		selectedModelName = '';
		// appModelStatus is updated by ModelLoader's statusUpdate event
		currentStep = 1;
		isAudioLoaded = false;
		audioBuffer = null;
		appAudioStatus = 'No audio loaded.';
		// transcriptionResult = ''; // Managed by TranscriptionControls
	}

	function handleAudioReady(event: CustomEvent<{ buffer: Float32Array; fileName?: string }>) {
		audioBuffer = event.detail.buffer;
		isAudioLoaded = true;
		// appAudioStatus is updated by AudioInput's statusUpdate event
		currentStep = 3;
		// transcriptionResult = ''; // Reset if needed, managed by TranscriptionControls
	}

	function handleAudioCleared() {
		audioBuffer = null;
		isAudioLoaded = false;
		// appAudioStatus is updated by AudioInput's statusUpdate event
		if (currentStep === 3) currentStep = 2;
		// transcriptionResult = ''; // Managed by TranscriptionControls
	}

	// This handler is for when TranscriptionControls finishes and emits the result
	// If you want App.svelte to store the final transcription result, you'd use this.
	// Otherwise, TranscriptionControls can display it directly.
	// let finalTranscriptionResult = '';
	// function handleTranscriptionComplete(event: CustomEvent<{ result: string }>) {
	// 	finalTranscriptionResult = event.detail.result;
	// }

	function handleModelStatusUpdate(event: CustomEvent<string>) {
		appModelStatus = event.detail;
	}

	function handleAudioStatusUpdate(event: CustomEvent<string>) {
		appAudioStatus = event.detail;
	}

	onDestroy(() => {
		if (whisperModule && whisperContextId) {
			try {
				whisperModule.free(whisperContextId);
				printToLog(`Freed Whisper context ${whisperContextId} on App destroy.`);
			} catch (e) {
				printToLog(`Error freeing context on App destroy: ${e}`, 'error');
			}
		}
	});

	const initialNumThreads = Math.min(
		16,
		Math.max(1, Math.floor((navigator.hardwareConcurrency || 4) / 2))
	);
</script>

<svelte:head>
	<title>Whisper.cpp WASM Svelte (Refactored)</title>
</svelte:head>

<Toaster richColors position="top-right" />

<div class="container mx-auto space-y-6 p-4">
	<header class="text-center">
		<h1 class="text-3xl font-bold">Whisper.cpp WASM Transcription</h1>
		<p class="text-muted-foreground">Transcribe audio fully in your browser.</p>
	</header>

	<hr class="border-border my-6" />

	<ModelLoader
		{whisperModule}
		{isWasmReady}
		{isWasmLoading}
		initialModelStatus={appModelStatus}
		on:log={handleLogFromChild}
		on:notify={handleNotifyFromChild}
		on:modelInitialized={handleModelInitialized}
		on:modelUnloaded={handleModelUnloaded}
		on:statusUpdate={handleModelStatusUpdate}
	/>

	{#if currentStep >= 2}
		<AudioInput
			{isModelLoaded}
			initialAudioStatus={appAudioStatus}
			on:log={handleLogFromChild}
			on:notify={handleNotifyFromChild}
			on:audioReady={handleAudioReady}
			on:audioCleared={handleAudioCleared}
			on:statusUpdate={handleAudioStatusUpdate}
		/>
	{/if}

	{#if currentStep >= 3 && isAudioLoaded && isModelLoaded && audioBuffer && whisperContextId}
		<TranscriptionControls
			{whisperModule}
			{whisperContextId}
			{audioBuffer}
			{isModelLoaded}
			{isAudioLoaded}
			{initialNumThreads}
			initialSelectedLanguage="en"
			on:log={handleLogFromChild}
			on:notify={handleNotifyFromChild}
			on:transcriptionComplete={(e) => {
				/* App can handle result if needed */
			}}
		/>
	{/if}

	<LogViewer {logOutput} />

	<footer class="text-muted-foreground py-4 text-center text-sm">
		Based on whisper.cpp by Georgi Gerganov. Svelte integration.
	</footer>
</div>
