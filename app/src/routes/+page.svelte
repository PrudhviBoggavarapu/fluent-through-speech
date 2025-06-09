<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Toaster, toast } from 'svelte-sonner';
	import practiceStore, { resetPractice } from '$lib/stores/practiceStore';
	import { languages as languageOptionsConstant } from '$lib/constants';

	import AppHeader from '$lib/components/layout/AppHeader.svelte';
	import AppSidebar from '$lib/components/layout/AppSidebar.svelte';
	import AppFooter from '$lib/components/layout/AppFooter.svelte';
	import StorySelectorView from '$lib/components/page/StorySelectorView.svelte';
	import PracticeModeView from '$lib/components/page/PracticeModeView.svelte';
	import DebugSection from '$lib/components/page/DebugSection.svelte';
	import type { Story } from '$lib/constants';
	import { stories } from '$lib/constants';

	type $$Props = {
		initialAvailableStories?: readonly Story[];
		initialId?: string;
	};

	// Use the stories from the module script as the default
	let { initialAvailableStories = stories, initialId = stories[0].id }: $$Props = $props();

	let availableStories = $state(initialAvailableStories);
	let selectedStoryId = $state<string>(initialId);
	let selectedGlobalLanguage = $state<string>('es');
	let showDebugInfo = $state(false);
	let showSidebar = $state(true);

	let selectedStory: Story = $derived.by(() => {
		const found = availableStories.find((s: Story) => s.id === selectedStoryId);
		return found || availableStories[0];
	});

	let logOutput = $state('Welcome to FluentThroughSpeech with Whisper!\n');
	let appModelStatus = $state('Whisper not initialized. Start practice to load model.');
	let currentSelectedModelName = $state('');
	let isModelLoaded = $state(false);
	let whisperContextId = $state<number | null>(null);
	let whisperModule: any = $state(null);
	let isWasmReady = $state(false);
	let isWasmLoading = $state(false);

	function printToLog(text: string, type: 'info' | 'error' | 'warn' = 'info') {
		const prefix = type === 'error' ? 'ERROR: ' : type === 'warn' ? 'WARN: ' : '';
		logOutput += `${prefix}${text}\n`;
	}

	async function initializeWhisperSystems() {
		if (isWasmReady || isWasmLoading) {
			return;
		}
		isWasmLoading = true;
		appModelStatus = 'Initializing Whisper Audio Engine...';
		toast.info('Initializing Whisper audio engine...');

		if ('serviceWorker' in navigator) {
			try {
				await navigator.serviceWorker.register('/coi-serviceworker.min.js', { scope: '/' });
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
			},
			monitorRunDependencies: (left: number) => {},
			onRuntimeInitialized: async () => {
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
		currentSelectedModelName = event.detail.modelName;
		isModelLoaded = true;
	}

	function handleModelUnloaded() {
		if (whisperModule && whisperContextId) {
			try {
				whisperModule.free(whisperContextId);
			} catch (e: any) {
				printToLog(`Error freeing context ${whisperContextId}: ${e.message}`, 'error');
			}
		}
		whisperContextId = null;
		isModelLoaded = false;
		currentSelectedModelName = '';
		appModelStatus = 'Model unloaded. Select a language and text to start practice.';
	}

	function handleModelStatusUpdate(event: CustomEvent<string>) {
		appModelStatus = event.detail;
	}

	function handleParagraphInputPracticeStarted() {
		if (!isWasmReady && !isWasmLoading) {
			initializeWhisperSystems();
		}
	}

	onDestroy(() => {
		if (whisperModule && whisperContextId) {
			try {
				whisperModule.free(whisperContextId);
			} catch (e: any) {
				printToLog(`Error freeing context on App destroy: ${e.message}`, 'error');
			}
		}
	});

	const initialNumThreads = Math.min(
		16,
		Math.max(1, Math.floor((navigator.hardwareConcurrency || 4) / 2))
	);

	function handleToastNotify(
		event: CustomEvent<{ type: 'success' | 'error' | 'info' | 'warning'; message: string }>
	) {
		toast[event.detail.type](event.detail.message);
	}
</script>

<svelte:head>
	<title>FluentThroughSpeech - Your Speaking Practice Hub</title>
	<meta
		name="description"
		content="Improve your English fluency and pronunciation by practicing with text and getting instant feedback through AI-powered speech-to-text."
	/>
</svelte:head>

<Toaster richColors position="top-right" />

<div class="flex h-screen flex-col bg-slate-900 text-slate-100">
	<AppHeader bind:showSidebar bind:showDebugInfo />

	<div class="flex flex-1 overflow-hidden">
		<AppSidebar stories={availableStories} bind:selectedStoryId bind:showSidebar />

		<main class="flex-1 overflow-y-auto px-4 pt-16 pb-6 md:h-full">
			{#if !$practiceStore.isPracticeMode}
				<StorySelectorView
					story={selectedStory}
					bind:selectedLanguage={selectedGlobalLanguage}
					languageOptions={languageOptionsConstant}
					onPracticeStart={handleParagraphInputPracticeStarted}
					isWhisperBusy={isWasmLoading || (isWasmReady && !isModelLoaded)}
				/>
			{:else}
				<PracticeModeView
					{whisperModule}
					{whisperContextId}
					{isModelLoaded}
					numThreadsForTranscription={initialNumThreads}
					languageForTranscription={selectedGlobalLanguage}
					onLog={handleLogFromChild}
					onPracticeEnd={resetPractice}
					{isWasmLoading}
					{isWasmReady}
				/>
			{/if}

			<DebugSection
				class={showDebugInfo ? '' : 'hidden'}
				{whisperModule}
				{isWasmReady}
				{isWasmLoading}
				preferredLanguage={selectedGlobalLanguage}
				initialModelStatus={appModelStatus}
				onLog={handleLogFromChild}
				onNotify={handleToastNotify}
				onModelInitialized={handleModelInitialized}
				onModelUnloaded={handleModelUnloaded}
				onModelStatusUpdate={handleModelStatusUpdate}
				{logOutput}
			/>
		</main>
	</div>

	<AppFooter />
</div>
