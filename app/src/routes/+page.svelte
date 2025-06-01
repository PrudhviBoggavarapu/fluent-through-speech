<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Toaster, toast } from 'svelte-sonner';

	import practiceStore, { resetPractice } from '$lib/stores/practiceStore'; // Removed startPractice as it's handled by ParagraphInput
	import ParagraphInput from '$lib/components/ParagraphInput.svelte';
	import PracticeDisplay from '$lib/components/PracticeDisplay.svelte';
	import ModelLoader from '$lib/components/whisper/ModelLoader.svelte';
	import LogViewer from '$lib/components/whisper/LogViewer.svelte';
	import { Button } from '$lib/components/ui/button';

	// --- Whisper State Variables ---
	let logOutput = $state('Welcome to FluentThroughSpeech with Whisper!\n');
	let appModelStatus = $state('Whisper not initialized. Click "Start Practice" to load.');
	let selectedModelName = $state('');
	let isModelLoaded = $state(false);
	let whisperContextId = $state<number | null>(null);

	let whisperModule: any = $state(null);
	let isWasmReady = $state(false);
	let isWasmLoading = $state(false);

	// --- Helper Functions ---
	function printToLog(text: string, type: 'info' | 'error' | 'warn' = 'info') {
		const prefix = type === 'error' ? 'ERROR: ' : type === 'warn' ? 'WARN: ' : '';
		logOutput += `${prefix}${text}\n`;
	}

	async function initializeWhisperSystems() {
		if (isWasmReady || isWasmLoading) {
			printToLog('Whisper systems already initialized or loading.');
			return;
		}

		isWasmLoading = true;
		appModelStatus = 'Initializing Whisper WASM...';
		printToLog('Initializing Whisper WASM systems...');
		toast.info('Initializing Whisper audio engine...');

		if ('serviceWorker' in navigator) {
			try {
				await navigator.serviceWorker.register('/coi-serviceworker.min.js', { scope: '/' });
				printToLog('COI Service Worker registered successfully with scope: /');
			} catch (e: any) {
				printToLog(
					`COI Service Worker registration failed: ${e.message}. Transcription may not work.`,
					'error'
				);
				isWasmLoading = false;
				isWasmReady = false;
				appModelStatus = 'COI Service Worker failed. Transcription disabled.';
				toast.error(
					`COI Service Worker registration failed: ${e.message}. Transcription may not work.`
				);
				return;
			}
		} else {
			printToLog('Service Workers not supported in this browser.', 'warn');
			toast.warning('Service Workers not supported. Transcription might not work.');
		}

		try {
			const helpersScript = document.createElement('script');
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
				appModelStatus = 'Failed to load Whisper helper scripts.';
				toast.error('Failed to load essential Whisper script (helpers.js).');
			};
			document.head.appendChild(helpersScript);
		} catch (e: any) {
			printToLog(`Error setting up helpers.js: ${e.message}`, 'error');
			isWasmLoading = false;
			isWasmReady = false;
			appModelStatus = `Error setting up Whisper: ${e.message}`;
			toast.error(`Error setting up Whisper: ${e.message}`);
		}
	}

	function loadMainJs() {
		(window as any).Module = {
			print: (text: string) => printToLog(`WASM: ${text}`),
			printErr: (text: string) => printToLog(`WASM_ERR: ${text}`, 'error'),
			setStatus: (text: string) => {
				if (!text && isWasmReady && !isModelLoaded && appModelStatus.includes('No model loaded'))
					return;
				printToLog(`WASM_STATUS: ${text}`);
			},
			monitorRunDependencies: (left: number) => {},
			onRuntimeInitialized: async () => {
				printToLog('Whisper WASM Runtime Initialized!');
				isWasmReady = true;
				isWasmLoading = false;
				whisperModule = (window as any).Module;
				appModelStatus = 'WASM Runtime Ready. Select or load a model.';
				toast.success('Whisper WASM engine ready!');
			},
			locateFile: (path: string, prefix: string) => {
				if (path.endsWith('.wasm')) {
					return '/whisper.wasm';
				}
				return prefix + path;
			}
		};

		try {
			const mainScript = document.createElement('script');
			mainScript.src = '/libmain.js';
			mainScript.async = true;
			mainScript.onload = () => {
				printToLog('libmain.js script tag loaded. Waiting for runtime initialization...');
			};
			mainScript.onerror = () => {
				printToLog('Failed to load libmain.js.', 'error');
				isWasmLoading = false;
				isWasmReady = false;
				appModelStatus = 'Error loading WASM module (libmain.js).';
				toast.error('Failed to load Whisper WASM module.');
			};
			document.head.appendChild(mainScript);
		} catch (e: any) {
			printToLog(`Error loading libmain.js: ${e.message}`, 'error');
			isWasmLoading = false;
			isWasmReady = false;
			appModelStatus = `Error loading WASM module: ${e.message}`;
			toast.error('Failed to load Whisper WASM module.');
		}
	}

	$effect(() => {
		if ($practiceStore.isPracticeMode && !isWasmReady && !isWasmLoading) {
			initializeWhisperSystems();
		}
	});

	function handleLogFromChild(
		event: CustomEvent<{ text: string; type?: 'info' | 'error' | 'warn' }>
	) {
		printToLog(event.detail.text, event.detail.type);
	}

	function handleModelInitialized(event: CustomEvent<{ contextId: number; modelName: string }>) {
		whisperContextId = event.detail.contextId;
		selectedModelName = event.detail.modelName;
		isModelLoaded = true;
		printToLog(
			`Model ${event.detail.modelName} initialized with context ID ${event.detail.contextId}.`
		);
	}

	function handleModelUnloaded() {
		if (whisperModule && whisperContextId) {
			try {
				whisperModule.free(whisperContextId);
				printToLog(`Freed context ${whisperContextId} due to model change.`);
			} catch (e: any) {
				printToLog(`Error freeing context ${whisperContextId}: ${e.message}`, 'error');
			}
		}
		whisperContextId = null;
		isModelLoaded = false;
		selectedModelName = '';
		appModelStatus = 'Model unloaded. Please select or upload a new model.';
		printToLog('Model unloaded.');
	}

	function handleModelStatusUpdate(event: CustomEvent<string>) {
		appModelStatus = event.detail;
	}

	function handleParagraphInputPracticeStarted() {
		printToLog('Practice mode initiated from ParagraphInput.');
	}

	onDestroy(() => {
		if (whisperModule && whisperContextId) {
			try {
				whisperModule.free(whisperContextId);
				printToLog(`Freed Whisper context ${whisperContextId} on App destroy.`);
			} catch (e: any) {
				printToLog(`Error freeing context on App destroy: ${e.message}`, 'error');
			}
		}
	});

	const initialNumThreads = Math.min(
		16,
		Math.max(1, Math.floor((navigator.hardwareConcurrency || 4) / 2))
	);
</script>

<svelte:head>
	<title>FluentThroughSpeech - Practice</title>
</svelte:head>

<Toaster richColors position="top-right" />

<div class="bg-background text-foreground flex min-h-screen flex-col items-center space-y-6 p-4">
	{#if !$practiceStore.isPracticeMode}
		<ParagraphInput on:practiceStarted={handleParagraphInputPracticeStarted} />
	{:else}
		{#if !isModelLoaded && isWasmLoading}
			<div class="p-8 text-center">
				<p class="text-xl font-semibold">Initializing Whisper Audio Engine...</p>
				<p class="text-muted-foreground">This may take a moment.</p>
			</div>
		{:else if !isModelLoaded && !isWasmLoading && isWasmReady}
			<div class="p-8 text-center">
				<p class="text-xl font-semibold">Loading Whisper Model...</p>
				<p class="text-muted-foreground">Please wait for the model to download and initialize.</p>
			</div>
		{/if}
		<PracticeDisplay
			{whisperModule}
			{whisperContextId}
			{isModelLoaded}
			numThreadsForTranscription={initialNumThreads}
			languageForTranscription="en"
			on:log={handleLogFromChild}
		/>
		<Button onclick={resetPractice} variant="outline" class="mt-8">
			End Practice / New Paragraph
		</Button>
	{/if}

	<div class="w-full max-w-2xl space-y-4">
		<ModelLoader
			{whisperModule}
			{isWasmReady}
			{isWasmLoading}
			initialModelStatus={appModelStatus}
			on:log={handleLogFromChild}
			on:notify={(e) => toast[e.detail.type](e.detail.message)}
			on:modelInitialized={handleModelInitialized}
			on:modelUnloaded={handleModelUnloaded}
			on:statusUpdate={handleModelStatusUpdate}
		/>
		<LogViewer {logOutput} />
	</div>
</div>
