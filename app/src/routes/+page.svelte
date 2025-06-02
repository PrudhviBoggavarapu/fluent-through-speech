<!-- src/routes/+page.svelte -->
<script lang="ts" module>
	// "schema": our internal JSON of stories
	export const stories = [
		{
			id: 'fox',
			title: 'The Quick Brown Fox',
			category: 'Classics',
			difficulty: 'Easy',
			content:
				'The quick brown fox jumps over the lazy dog. This is a common pangram. It contains every letter of the alphabet. You can use it to test typefaces or keyboards. What a fun sentence to practice your enunciation and speed!'
		},
		{
			id: 'svelte-intro',
			title: 'About Svelte',
			category: 'Technology',
			difficulty: 'Medium',
			content:
				"Svelte is a radical new approach to building user interfaces. Whereas traditional frameworks like React and Vue do the bulk of their work in the browser, Svelte shifts that work into a compile step that happens when you build your app. This means no virtual DOM, just highly optimized vanilla JavaScript. It's a compiler that turns your declarative components into efficient imperative code that runs blazingly fast."
		},
		{
			id: 'gettysburg',
			title: 'Gettysburg Address (Excerpt)',
			category: 'Speeches',
			difficulty: 'Hard',
			content:
				'Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal. Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure. We are met on a great battle-field of that war. We have come to dedicate a portion of that field, as a final resting place for those who here gave their lives that that nation might live. It is altogether fitting and proper that we should do this.'
		},
		{
			id: 'road_not_taken',
			title: 'The Road Not Taken (Frost)',
			category: 'Poetry',
			difficulty: 'Medium',
			content:
				'Two roads diverged in a yellow wood, And sorry I could not travel both And be one traveler, long I stood And looked down one as far as I could To where it bent in the undergrowth; Then took the other, as just as fair, And having perhaps the better claim, Because it was grassy and wanted wear; Though as for that the passing there Had worn them really about the same, And both that morning equally lay In leaves no step had trodden black. Oh, I kept the first for another day! Yet knowing how way leads on to way, I doubted if I should ever come back. I shall be telling this with a sigh Somewhere ages and ages hence: Two roads diverged in a wood, and I— I took the one less traveled by, And that has made all the difference.'
		},
		{
			id: 'dream_speech',
			title: 'I Have a Dream (MLK Jr. - Excerpt)',
			category: 'Speeches',
			difficulty: 'Hard',
			content:
				'I have a dream that one day this nation will rise up and live out the true meaning of its creed: We hold these truths to be self-evident, that all men are created equal. I have a dream that one day on the red hills of Georgia, the sons of former slaves and the sons of former slave owners will be able to sit down together at the table of brotherhood. I have a dream that one day even the state of Mississippi, a state sweltering with the heat of injustice, sweltering with the heat of oppression, will be transformed into an oasis of freedom and justice. I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin but by the content of their character.'
		}
	] as const;

	export type Story = (typeof stories)[number];
</script>

<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Toaster, toast } from 'svelte-sonner';
	import practiceStore, { resetPractice } from '$lib/stores/practiceStore';
	import ParagraphInput from '$lib/components/ParagraphInput.svelte';
	import PracticeDisplay from '$lib/components/PracticeDisplay.svelte';
	import ModelLoader from '$lib/components/whisper/ModelLoader.svelte';
	import LogViewer from '$lib/components/whisper/LogViewer.svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import UserCircleIcon from '@lucide/svelte/icons/user-circle-2';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import BookOpenTextIcon from '@lucide/svelte/icons/book-open-text';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

	// Props for the page, using the stories from the module script as default
	let {
		stories: availableStories = stories,
		initialId = stories[0].id
	}: { stories?: readonly Story[]; initialId?: string } = $props();

	// --- Page State ---
	let selectedStoryId = $state<string>(initialId);
	let toggle_for_debug = false;

	// Explicitly type selectedStory with the Story type from the module script
	let selectedStory: Story = $derived.by(() => {
		const found = availableStories.find((s) => s.id === selectedStoryId);
		console.log(
			`[Page $derived selectedStory] ID: ${selectedStoryId}, Found: ${!!found}, Title: ${found?.title.substring(0, 20)}`
		);
		return found || availableStories[0];
	});

	let showSidebar = $state(true); // For potential mobile toggle

	// --- Whisper State Variables ---
	let logOutput = $state('Welcome to FluentThroughSpeech with Whisper!\n');
	let appModelStatus = $state('Whisper not initialized. Start practice to load model.');
	let currentSelectedModelName = $state('');
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
			// printToLog('Whisper systems already initialized or loading.');
			return;
		}
		isWasmLoading = true;
		appModelStatus = 'Initializing Whisper Audio Engine...';
		// printToLog('Initializing Whisper WASM systems...');
		toast.info('Initializing Whisper audio engine...');

		if ('serviceWorker' in navigator) {
			try {
				await navigator.serviceWorker.register('/coi-serviceworker.min.js', { scope: '/' });
				// printToLog('COI Service Worker registered successfully with scope: /');
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
				// printToLog('helpers.js loaded.');
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
				// printToLog(`WASM_STATUS: ${text}`);
			},
			monitorRunDependencies: (left: number) => {},
			onRuntimeInitialized: async () => {
				// printToLog('Whisper WASM Runtime Initialized!');
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
				// printToLog('libmain.js script tag loaded. Waiting for runtime initialization...');
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

	// --- Event Handlers & Effects ---
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
		// printToLog(
		// 	`Model ${event.detail.modelName} initialized with context ID ${event.detail.contextId}.`
		// );
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
		appModelStatus = 'Model unloaded.';
		// printToLog('Model unloaded.');
	}

	function handleModelStatusUpdate(event: CustomEvent<string>) {
		appModelStatus = event.detail;
	}

	function handleParagraphInputPracticeStarted() {
		// printToLog('Practice mode initiated from ParagraphInput.');
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
</script>

<svelte:head>
	<title>FluentThroughSpeech - Your Speaking Practice Hub</title>
	<meta
		name="description"
		content="Improve your English fluency and pronunciation by practicing with text and getting instant feedback through AI-powered speech-to-text."
	/>
</svelte:head>

<Toaster richColors position="top-right" />

<div class="flex min-h-screen flex-col bg-slate-900 text-slate-100">
	<!-- Top Bar -->
	<nav
		class="sticky top-0 z-50 flex items-center justify-between bg-slate-800/80 p-3 px-4 shadow-md backdrop-blur-md md:px-6"
	>
		<div class="flex items-center gap-2">
			<Button
				variant="ghost"
				size="icon"
				class="text-slate-100 hover:bg-slate-700 md:hidden"
				onclick={() => (showSidebar = !showSidebar)}
			>
				<MenuIcon class="h-6 w-6" />
			</Button>
			<BookOpenTextIcon class="h-8 w-8 text-purple-400" />
			<h1 class="text-xl font-semibold tracking-tight text-slate-100">FluentThroughSpeech</h1>
		</div>
		<div class="flex items-center gap-2">
			<Button
				variant="ghost"
				size="icon"
				title="User Profile (Coming Soon!)"
				class="text-slate-300 hover:bg-slate-700 hover:text-slate-100"
			>
				<UserCircleIcon class="h-6 w-6" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				title="Settings (Coming Soon!)"
				class="text-slate-300 hover:bg-slate-700 hover:text-slate-100"
			>
				<SettingsIcon class="h-6 w-6" />
			</Button>
		</div>
	</nav>

	<div class="flex flex-1">
		<!-- Left Sidebar: Story Selector -->
		{#if showSidebar}
			<aside
				class="fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-700 bg-slate-800/90 text-slate-300 shadow-lg transition-transform duration-300 ease-in-out md:static md:translate-x-0 {showSidebar
					? 'translate-x-0 pt-16 md:pt-0'
					: '-translate-x-full pt-16 md:pt-0'}"
			>
				<div class="h-full overflow-y-auto p-4">
					<h2 class="mb-4 text-lg font-semibold tracking-tight text-slate-100">
						Choose Your Passage
					</h2>
					<ul class="space-y-1">
						{#each availableStories as story (story.id)}
							<li>
								<button
									onclick={() => {
										selectedStoryId = story.id;
										if (window.innerWidth < 768) showSidebar = false;
									}}
									class="flex w-full items-center justify-between rounded-md p-2.5 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none
										{selectedStoryId === story.id
										? 'bg-purple-500/20 font-medium text-purple-200'
										: 'hover:bg-slate-700 hover:text-slate-100'}"
								>
									<div class="flex-1">
										<p class="font-medium">{story.title}</p>
										<p class="text-xs text-slate-400">
											{story.category} - {story.difficulty}
										</p>
									</div>
									{#if selectedStoryId === story.id}
										<ChevronRightIcon class="h-5 w-5 text-purple-300" />
									{/if}
								</button>
							</li>
						{/each}
					</ul>
					<div class="mt-6 border-t border-slate-700 pt-4">
						<p class="text-xs text-slate-400">
							(Future: Filter by difficulty/category, search passages)
						</p>
					</div>
				</div>
			</aside>
		{/if}

		<!-- Main Content Area -->

		{#if toggle_for_debug}
			<main class="flex-1 p-4 pt-6 md:p-8">
				{#if !$practiceStore.isPracticeMode}
					<Card class="mx-auto w-full max-w-3xl bg-slate-800 text-slate-100 shadow-xl">
						<CardHeader>
							<CardTitle class="text-center text-3xl font-bold text-slate-100"
								>{selectedStory.title}</CardTitle
							>
							<CardDescription class="text-center text-slate-400">
								Category: {selectedStory.category} | Difficulty: {selectedStory.difficulty}
							</CardDescription>
						</CardHeader>
						<CardContent class="mt-4">
							{#if selectedStory && selectedStory.content}
								<ParagraphInput
									initialParagraph={selectedStory.content}
									on:practiceStarted={handleParagraphInputPracticeStarted}
								/>
							{:else}
								<div
									class="flex min-h-[200px] items-center justify-center rounded-md border border-dashed border-slate-700 bg-slate-700/50 p-4"
								>
									<p class="text-slate-400">Select a story to begin.</p>
								</div>
							{/if}
							<div class="mt-8 rounded-lg border border-dashed border-slate-700 p-4 text-center">
								<p class="text-slate-400">
									✨ Tip: Speak clearly and at a natural pace. (More tips coming soon!) ✨
								</p>
							</div>
						</CardContent>
					</Card>
				{:else}
					<!-- Practice Mode UI -->
					{#if !isModelLoaded && isWasmLoading}
						<div class="flex h-full flex-col items-center justify-center p-8 text-center">
							<div
								class="loader mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"
							></div>
							<p class="text-xl font-semibold text-slate-100">
								Initializing Whisper Audio Engine...
							</p>
							<p class="text-slate-400">
								This may take a moment. Please ensure you have a stable internet connection.
							</p>
						</div>
					{:else if !isModelLoaded && !isWasmLoading && isWasmReady}
						<div class="flex h-full flex-col items-center justify-center p-8 text-center">
							<div
								class="loader mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"
							></div>
							<p class="text-xl font-semibold text-slate-100">Loading Whisper Model...</p>
							<p class="text-slate-400">
								The model is being downloaded and initialized. This can take some time.
							</p>
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
					<div class="mt-8 flex justify-center">
						<Button
							onclick={resetPractice}
							class="bg-violet-500 py-3 text-lg text-slate-100 hover:bg-violet-400"
							size="lg"
						>
							End Practice / New Passage
						</Button>
					</div>
				{/if}

				{#if $practiceStore.isPracticeMode || false}
					<!-- Set to true to always show for dev, false for prod to hide by default -->
					<div class="mx-auto mt-10 w-full max-w-3xl space-y-6">
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
				{/if}
			</main>
		{:else}{/if}
	</div>

	<!-- Footer -->
	<footer class="border-t border-slate-700 bg-slate-800/80 p-4 text-center text-xs text-slate-400">
		<p>&copy; {new Date().getFullYear()} FluentThroughSpeech. Powered by Svelte & Whisper.cpp.</p>
		<p class="mt-1">
			For best results, use a modern browser. Ensure microphone permissions are granted.
		</p>
		<p class="mt-1">(Future: Privacy Policy | About | Leaderboard)</p>
	</footer>
</div>

<style>
	.loader {
		border-style: solid;
	}
	@media (max-width: 767px) {
		aside.fixed {
			padding-top: 4rem; /* Approx height of nav */
		}
	}
	/* Custom scrollbar for webkit browsers (like Chrome, Safari) */
	aside ::-webkit-scrollbar {
		width: 8px;
	}
	aside ::-webkit-scrollbar-track {
		background-color: #334155; /* slate-700 */
		border-radius: 10px;
	}
	aside ::-webkit-scrollbar-thumb {
		background-color: #a855f7; /* purple-500 */
		border-radius: 10px;
	}
	aside ::-webkit-scrollbar-thumb:hover {
		background-color: #c084fc; /* purple-400 */
	}
</style>
