<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import {
		models,
		MODEL_FILENAME_IN_FS,
		DEFAULT_MODEL_PATH, // Primary default model
		DEFAULT_MODEL_NAME // Primary default model name
		// DEFAULT_MODEL_PATH_EN and DEFAULT_MODEL_NAME_EN are no longer used for auto-load decision
	} from '$lib/constants';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';

	let {
		whisperModule,
		isWasmReady,
		isWasmLoading,
		initialModelStatus = 'No model loaded. Please select an option below.',
		preferredLanguage = '' // This prop is kept for potential future use or clarity but won't change auto-load target
	}: {
		whisperModule: any;
		isWasmReady: boolean;
		isWasmLoading: boolean;
		initialModelStatus?: string;
		preferredLanguage?: string; // Kept for consistency, but auto-load always picks multilingual
	} = $props();

	let isLoadingModel = $state(false);
	let modelLoadProgress = $state(0);
	let currentSelectedModelName = $state('');
	let internalModelStatus = $state(initialModelStatus);
	let internalIsModelLoaded = $state(false);
	let internalWhisperContextId = $state<number | null>(null);

	const dispatch = createEventDispatcher<{
		log: { text: string; type?: 'info' | 'error' | 'warn' };
		notify: { type: 'success' | 'error' | 'info' | 'warning'; message: string };
		modelInitialized: { contextId: number; modelName: string };
		modelUnloaded: void;
		statusUpdate: string;
	}>();

	$effect(() => {
		if (isLoadingModel) {
			internalModelStatus = `Loading: ${currentSelectedModelName} - ${modelLoadProgress}%`;
		} else if (internalIsModelLoaded) {
			internalModelStatus = `Model "${currentSelectedModelName}" is loaded. Context ID: ${internalWhisperContextId}`;
		} else if (isWasmLoading) {
			internalModelStatus = 'Whisper WASM Runtime is loading...';
		} else if (!isWasmReady) {
			internalModelStatus =
				'Whisper WASM Runtime not ready. Click "Start Practice" on main page to initialize.';
		} else {
			internalModelStatus = 'WASM Ready. Attempting to load default multilingual model...';
		}
		dispatch('statusUpdate', internalModelStatus);
	});

	$effect(() => {
		if (isWasmReady && whisperModule && !internalIsModelLoaded && !isLoadingModel) {
			log('WASM ready and no model loaded/loading. Initiating automatic model load.');
			initiateAutomaticModelLoad();
		}
	});

	function log(text: string, type: 'info' | 'error' | 'warn' = 'info') {
		dispatch('log', { text, type });
	}

	async function initiateAutomaticModelLoad() {
		if (!isWasmReady || !whisperModule || isLoadingModel || internalIsModelLoaded) {
			if (internalIsModelLoaded) {
				log('Model already loaded, skipping automatic load.', 'info');
			} else {
				log(
					'Conditions not met for automatic model load (WASM not ready, already loading, or module missing).',
					'warn'
				);
			}
			return;
		}
		isLoadingModel = true;
		modelLoadProgress = 0;

		const modelPathToLoad = DEFAULT_MODEL_PATH;
		const modelNameToLoad = DEFAULT_MODEL_NAME;
		const modelLogName = `Default multilingual model (${DEFAULT_MODEL_NAME})`;

		currentSelectedModelName = modelNameToLoad; // Update UI to show which model is being attempted

		log(`Attempting to auto-load: ${modelLogName} from ${modelPathToLoad}`);
		dispatch('notify', { type: 'info', message: `Loading ${modelLogName}...` });

		try {
			const response = await fetch(modelPathToLoad);
			if (!response.ok) {
				throw new Error(`Failed to fetch ${modelPathToLoad}: ${response.statusText}`);
			}
			await processModelResponse(response, modelNameToLoad);
		} catch (error: any) {
			log(`Error auto-loading ${modelLogName}: ${error.message}`, 'error');
			isLoadingModel = false;
			currentSelectedModelName = ''; // Reset on failure
			dispatch('notify', { type: 'error', message: `Failed to auto-load model: ${error.message}` });
			internalModelStatus =
				'Failed to load default model automatically. Please try a manual option.';
		}
	}

	async function processModelResponse(response: Response, modelNameForInit: string) {
		const contentLength = response.headers.get('content-length');
		const totalSize = contentLength ? parseInt(contentLength, 10) : 0;
		let loadedSize = 0;
		const reader = response.body?.getReader();
		if (!reader) throw new Error('Failed to get reader for model response body.');

		const chunks: Uint8Array[] = [];
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			if (value) {
				chunks.push(value);
				loadedSize += value.length;
				if (totalSize > 0) modelLoadProgress = Math.round((loadedSize / totalSize) * 100);
			}
		}
		const modelDataArray = new Uint8Array(loadedSize);
		let offset = 0;
		for (const chunk of chunks) {
			modelDataArray.set(chunk, offset);
			offset += chunk.length;
		}
		log(`${modelNameForInit} fetched. Storing in WASM FS...`);
		try {
			whisperModule.FS_unlink(MODEL_FILENAME_IN_FS);
		} catch (e) {
			/* Ignore */
		}
		whisperModule.FS_createDataFile('/', MODEL_FILENAME_IN_FS, modelDataArray, true, true, true);
		log(`${modelNameForInit} stored as ${MODEL_FILENAME_IN_FS} in WASM FS.`);
		initializeWhisperContext(modelNameForInit);
	}

	async function fetchAndStoreModel(modelKey: keyof typeof models) {
		if (!isWasmReady || !(window as any).loadRemote || isLoadingModel) {
			log('WASM not ready, loadRemote not available, or already loading.', 'error');
			if (!isWasmReady || !(window as any).loadRemote) {
				dispatch('notify', {
					type: 'error',
					message: 'WASM components not ready for manual load.'
				});
			}
			return;
		}
		isLoadingModel = true;
		modelLoadProgress = 0;
		currentSelectedModelName = modelKey;
		log(`Fetching model: ${modelKey}`);
		dispatch('notify', { type: 'info', message: `Fetching ${modelKey}...` });
		const modelInfo = models[modelKey];
		const url = modelInfo.url;
		const size_mb = modelInfo.size;
		const cbProgress = (p: number) => (modelLoadProgress = Math.round(p * 100));
		const cbReady = (_fname_dst: string, data: Uint8Array) => {
			log(`Model ${modelKey} downloaded. Storing in WASM FS...`);
			try {
				whisperModule.FS_unlink(MODEL_FILENAME_IN_FS);
			} catch (e) {
				/* Ignore */
			}
			whisperModule.FS_createDataFile('/', MODEL_FILENAME_IN_FS, data, true, true, true);
			log(`Model ${modelKey} stored as ${MODEL_FILENAME_IN_FS} in WASM FS.`);
			initializeWhisperContext(modelKey);
		};
		const cbCancel = () => {
			log(`Model download cancelled: ${modelKey}`, 'warn');
			isLoadingModel = false;
			currentSelectedModelName = '';
			internalModelStatus = 'Model download cancelled. Please select an option.';
		};
		(window as any).loadRemote(
			url,
			MODEL_FILENAME_IN_FS,
			size_mb,
			cbProgress,
			cbReady,
			cbCancel,
			(text: string) => log(`loadRemote: ${text}`)
		);
	}

	function handleModelFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		if (!isWasmReady || !whisperModule || isLoadingModel) {
			log('WASM not ready or already loading. Cannot load model file.', 'error');
			if (!isWasmReady || !whisperModule) {
				dispatch('notify', { type: 'error', message: 'WASM components not ready.' });
			}
			return;
		}
		isLoadingModel = true;
		modelLoadProgress = 0;
		currentSelectedModelName = file.name;
		log(`Loading model from file: ${file.name}`);
		dispatch('notify', { type: 'info', message: `Loading ${file.name}...` });
		const reader = new FileReader();
		reader.onload = (e) => {
			const buffer = e.target?.result as ArrayBuffer;
			if (buffer) {
				const data = new Uint8Array(buffer);
				log(`Model file ${file.name} read. Storing in WASM FS...`);
				try {
					whisperModule.FS_unlink(MODEL_FILENAME_IN_FS);
				} catch (err) {
					/* ignore */
				}
				whisperModule.FS_createDataFile('/', MODEL_FILENAME_IN_FS, data, true, true, true);
				log(`Model ${file.name} stored as ${MODEL_FILENAME_IN_FS} in WASM FS.`);
				initializeWhisperContext(file.name);
			} else {
				log('Failed to read model file.', 'error');
				isLoadingModel = false;
				currentSelectedModelName = '';
				dispatch('notify', { type: 'error', message: 'Error reading model file.' });
				internalModelStatus = 'Error reading model file. Please try again.';
			}
		};
		reader.onprogress = (e_progress) => {
			if (e_progress.lengthComputable)
				modelLoadProgress = Math.round((e_progress.loaded / e_progress.total) * 100);
		};
		reader.readAsArrayBuffer(file);
	}

	function initializeWhisperContext(modelNameUsedForInit: string) {
		if (!whisperModule) {
			log('Whisper module not available for context initialization.', 'error');
			isLoadingModel = false;
			internalModelStatus = 'Error: Whisper module not found.';
			return;
		}
		log(`Initializing Whisper context with model: ${modelNameUsedForInit}`);
		// currentSelectedModelName should already be set to modelNameUsedForInit by the calling function
		try {
			if (internalWhisperContextId !== null) {
				whisperModule.free(internalWhisperContextId);
				log(`Freed previous context: ${internalWhisperContextId}`);
				internalWhisperContextId = null;
			}
			const ctxId = whisperModule.init(MODEL_FILENAME_IN_FS);
			if (ctxId && ctxId > 0) {
				internalWhisperContextId = ctxId;
				internalIsModelLoaded = true;
				isLoadingModel = false;
				log(`Whisper context initialized. Context ID: ${ctxId}`);
				dispatch('notify', {
					type: 'success',
					message: `Model "${currentSelectedModelName}" loaded!`
				});
				dispatch('modelInitialized', { contextId: ctxId, modelName: currentSelectedModelName });
			} else {
				throw new Error(`Initialization returned invalid context ID: ${ctxId}`);
			}
		} catch (e: any) {
			log(`Error initializing Whisper context: ${e.message}`, 'error');
			console.error('Whisper init error:', e);
			internalIsModelLoaded = false;
			isLoadingModel = false;
			currentSelectedModelName = '';
			dispatch('notify', { type: 'error', message: `Failed to initialize model: ${e.message}` });
			internalModelStatus = `Failed to initialize model: ${e.message.split('(')[0]}`;
		}
	}

	function handleChangeModelClick() {
		if (whisperModule && internalWhisperContextId !== null) {
			try {
				whisperModule.free(internalWhisperContextId);
				log(`Freed context ${internalWhisperContextId} before change.`);
			} catch (e: any) {
				log(`Error freeing context: ${e.message}`, 'error');
			}
			internalWhisperContextId = null;
		}
		internalIsModelLoaded = false;
		isLoadingModel = false;
		currentSelectedModelName = '';
		internalModelStatus = 'Model unloaded. Please select an option.';
		dispatch('modelUnloaded');
	}
</script>

<div class="rounded-lg border border-slate-700 bg-slate-800 text-slate-100 shadow-md">
	<div class="p-6">
		<h2 class="text-xl font-semibold tracking-tight text-slate-100">Whisper Model Control</h2>
		<p class="mt-1 text-sm text-slate-400">{internalModelStatus}</p>
	</div>
	<div class="space-y-4 p-6 pt-0">
		{#if isWasmLoading}
			<div class="flex items-center space-x-2 text-slate-300">
				<LoaderCircleIcon class="h-5 w-5 animate-spin text-purple-400" />
				<span>Loading WASM runtime... Please wait.</span>
			</div>
		{:else if !isWasmReady}
			<p class="text-rose-400">
				WASM Runtime not ready. Click "Start Practice" on the main page to initialize.
			</p>
		{:else if isLoadingModel}
			<div>
				<progress
					value={modelLoadProgress}
					max="100"
					class="w-full [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-bar]:bg-slate-700 [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-value]:bg-purple-500"
				></progress>
				<p class="mt-1 text-sm text-slate-300">
					Loading: {currentSelectedModelName} - {modelLoadProgress}%
				</p>
			</div>
		{:else if !internalIsModelLoaded}
			<!-- Manual loading options are shown if auto-load failed or user wants to change -->
			<p class="text-center text-sm text-slate-400">
				Attempted automatic model load. If it failed or you want a different model, choose below:
			</p>
			<div class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
				{#each Object.entries(models) as [key, model]}
					<button
						class="rounded-md border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-purple-500/30 hover:text-purple-200 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
						onclick={() => fetchAndStoreModel(key as keyof typeof models)}
						disabled={isLoadingModel || !isWasmReady}
					>
						{key} ({model.size} MB)
					</button>
				{/each}
			</div>
			<div class="mt-4">
				<label for="model-file-upload" class="text-sm font-medium text-slate-300"
					>Or upload a .bin model file:</label
				>
				<input
					type="file"
					id="model-file-upload"
					accept=".bin"
					class="mt-1 flex h-10 w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 ring-offset-slate-900 file:border-0 file:bg-slate-600 file:text-sm file:font-medium file:text-purple-300 placeholder:text-slate-400 hover:file:bg-purple-500/20 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					onchange={handleModelFileSelect}
					disabled={isLoadingModel || !isWasmReady}
				/>
			</div>
		{:else}
			<!-- internalIsModelLoaded is true -->
			<p class="text-emerald-400">
				Model "{currentSelectedModelName}" is loaded! Context ID: {internalWhisperContextId}
			</p>
			<button
				class="mt-2 rounded-md border border-slate-600 bg-violet-500 px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-violet-400 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
				onclick={handleChangeModelClick}
			>
				Change Model
			</button>
		{/if}
	</div>
</div>
