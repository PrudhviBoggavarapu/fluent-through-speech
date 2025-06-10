<!-- src/routes/guided/+page.svelte -->
<script lang="ts">
	import { lessonStore } from '$lib/stores/lessonStore';
	import LessonHub from '$lib/components/guided/LessonHub.svelte';
	import LessonBriefing from '$lib/components/guided/LessonBriefing.svelte';
	import SentencePractice from '$lib/components/guided/SentencePractice.svelte';
	import FullRecital from '$lib/components/guided/FullRecital.svelte';
	import LessonComplete from '$lib/components/guided/LessonComplete.svelte';
	import AppHeader from '$lib/components/layout/AppHeader.svelte';
	import AppFooter from '$lib/components/layout/AppFooter.svelte';
	import DebugSection from '$lib/components/page/DebugSection.svelte';
	import { onDestroy } from 'svelte';
	import { Toaster, toast } from 'svelte-sonner';

	// --- UI State ---
	let showDebugInfo = $state(false);

	// --- Whisper Engine State ---
	let whisperModule: any = $state(null);
	let whisperContextId = $state<number | null>(null);
	let isModelLoaded = $state(false);
	let isWasmReady = $state(false);
	let isWasmLoading = $state(false);
	let appModelStatus = $state('Whisper engine not initialized.');
	let logOutput = $state('Welcome to Guided Practice Mode!\n');

	function printToLog(text: string, type: 'info' | 'error' | 'warn' = 'info') {
		const prefix = type === 'error' ? 'ERROR: ' : type === 'warn' ? 'WARN: ' : '';
		logOutput += `${prefix}${text}\n`;
	}

	// --- Whisper Initialization Logic ---
	async function initializeWhisperSystems() {
		if (isWasmReady || isWasmLoading) return;

		isWasmLoading = true;
		appModelStatus = 'Initializing Whisper Audio Engine...';
		toast.info('Initializing Whisper audio engine...');

		if ('serviceWorker' in navigator) {
			try {
				await navigator.serviceWorker.register('/coi-serviceworker.min.js', { scope: '/' });
			} catch (e: any) {
				toast.error(`COI Service Worker failed: ${e.message}. Transcription may not work.`);
				isWasmLoading = false;
				return;
			}
		}

		try {
			const helpersScript = document.createElement('script');
			helpersScript.src = '/whisper.wasm/helpers.js';
			helpersScript.onload = loadMainJs;
			helpersScript.onerror = () => {
				toast.error('Failed to load essential Whisper script (helpers.js).');
				isWasmLoading = false;
			};
			document.head.appendChild(helpersScript);
		} catch (e: any) {
			toast.error(`Error setting up Whisper: ${e.message}`);
			isWasmLoading = false;
		}
	}

	function loadMainJs() {
		(window as any).Module = {
			print: (text: string) => printToLog(`WASM: ${text}`),
			printErr: (text: string) => printToLog(`WASM_ERR: ${text}`, 'error'),
			setStatus: (text: string) => {
				if (!text && isWasmReady) return;
				appModelStatus = text;
			},
			monitorRunDependencies: () => {},
			onRuntimeInitialized: async () => {
				isWasmReady = true;
				isWasmLoading = false;
				whisperModule = (window as any).Module;
				appModelStatus = 'WASM Runtime Ready. Auto-loading model...';
				toast.success('Whisper WASM engine ready!');
			},
			locateFile: (path: string) => (path.endsWith('.wasm') ? '/whisper.wasm' : path)
		};

		try {
			const mainScript = document.createElement('script');
			mainScript.src = '/libmain.js';
			mainScript.async = true;
			mainScript.onerror = () => {
				toast.error('Failed to load Whisper WASM module.');
				isWasmLoading = false;
			};
			document.head.appendChild(mainScript);
		} catch (e: any) {
			toast.error(`Error loading WASM module: ${e.message}`);
			isWasmLoading = false;
		}
	}

	// --- Reactive Trigger for Initialization ---
	$effect(() => {
		if ($lessonStore.phase === 'practice' && !isWasmReady && !isWasmLoading) {
			initializeWhisperSystems();
		}
	});

	// --- Event Handlers for Child Components ---
	function handleModelInitialized(event: CustomEvent<{ contextId: number; modelName: string }>) {
		whisperContextId = event.detail.contextId;
		isModelLoaded = true;
		appModelStatus = `Model "${event.detail.modelName}" loaded.`;
	}

	function handleModelUnloaded() {
		if (whisperModule && whisperContextId) {
			whisperModule.free(whisperContextId);
		}
		whisperContextId = null;
		isModelLoaded = false;
		appModelStatus = 'Model unloaded.';
	}

	function handleLogFromChild(
		event: CustomEvent<{ text: string; type?: 'info' | 'error' | 'warn' }>
	) {
		printToLog(event.detail.text, event.detail.type);
	}

	function handleToastNotify(
		event: CustomEvent<{ type: 'success' | 'error' | 'info' | 'warning'; message: string }>
	) {
		toast[event.detail.type](event.detail.message);
	}

	function handleModelStatusUpdate(event: CustomEvent<string>) {
		appModelStatus = event.detail;
	}

	// Reset store on component destruction to ensure a clean state
	onDestroy(() => {
		lessonStore.returnToHub();
		if (whisperModule && whisperContextId) {
			whisperModule.free(whisperContextId);
		}
	});
</script>

<svelte:head>
	<title>Guided Practice - FluentThroughSpeech</title>
	<meta
		name="description"
		content="Follow structured lessons to improve your speaking and pronunciation skills step-by-step."
	/>
</svelte:head>

<Toaster richColors position="top-right" />

<div class="flex h-screen flex-col bg-slate-900 text-slate-100">
	<AppHeader bind:showDebugInfo />

	<div class="flex flex-1 overflow-hidden">
		<main class="flex flex-1 flex-col items-center justify-center overflow-y-auto p-4 md:p-8">
			{#if $lessonStore.phase === 'hub'}
				<LessonHub lessons={$lessonStore.lessons} />
			{:else if $lessonStore.phase === 'briefing' && $lessonStore.currentLesson}
				<LessonBriefing lesson={$lessonStore.currentLesson} />
			{:else if $lessonStore.phase === 'practice'}
				<SentencePractice
					{whisperModule}
					{whisperContextId}
					{isWasmReady}
					{isWasmLoading}
					{isModelLoaded}
					on:modelInitialized={handleModelInitialized}
					on:modelUnloaded={handleModelUnloaded}
					on:log={handleLogFromChild}
					on:notify={handleToastNotify}
				/>
			{:else if $lessonStore.phase === 'recital' && $lessonStore.currentLesson}
				<FullRecital
					lesson={$lessonStore.currentLesson}
					{whisperModule}
					{whisperContextId}
					{isModelLoaded}
					on:log={handleLogFromChild}
				/>
			{:else if $lessonStore.phase === 'complete'}
				<LessonComplete />
			{/if}

			<DebugSection
				class={showDebugInfo ? 'mt-8' : 'hidden'}
				{whisperModule}
				{isWasmReady}
				{isWasmLoading}
				preferredLanguage={$lessonStore.currentLesson?.lang ?? 'es'}
				initialModelStatus={appModelStatus}
				on:log={handleLogFromChild}
				on:notify={handleToastNotify}
				on:modelInitialized={handleModelInitialized}
				on:modelUnloaded={handleModelUnloaded}
				on:modelStatusUpdate={handleModelStatusUpdate}
				{logOutput}
			/>
		</main>
	</div>

	<AppFooter />
</div>
