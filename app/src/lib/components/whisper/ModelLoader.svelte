<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import {
		models,
		MODEL_FILENAME_IN_FS,
		DEFAULT_MODEL_PATH,
		DEFAULT_MODEL_NAME
	} from '$lib/constants';
	import {
		cardClasses,
		cardHeaderClasses,
		cardTitleClasses,
		cardDescriptionClasses,
		cardContentClasses,
		outlineButtonClasses,
		inputClasses,
		labelClasses,
		svelteProgressClasses
	} from '$lib/uiClasses';

	export let whisperModule: any;
	export let isWasmReady: boolean;
	export let isWasmLoading: boolean; // To show initial WASM loading state
	export let initialModelStatus = 'No model loaded.';

	// Internal state
	let isLoadingModel = false;
	let modelLoadProgress = 0;
	let currentSelectedModelName = '';
	let internalModelStatus = initialModelStatus;
	let internalIsModelLoaded = false;
	let internalWhisperContextId: number | null = null;

	const dispatch = createEventDispatcher<{
		log: { text: string; type?: 'info' | 'error' | 'warn' };
		notify: { type: 'success' | 'error' | 'info' | 'warning'; message: string };
		modelInitialized: { contextId: number; modelName: string };
		modelUnloaded: void;
		statusUpdate: string; // For App.svelte to update its general status if needed
	}>();

	$: internalModelStatus = isLoadingModel
		? `Loading: ${currentSelectedModelName} - ${modelLoadProgress}%`
		: internalIsModelLoaded
			? `Model "${currentSelectedModelName}" is loaded. Context ID: ${internalWhisperContextId}`
			: initialModelStatus;

	onMount(() => {
		// This component might mount after WASM is ready, so auto-load if appropriate
		if (isWasmReady && !internalIsModelLoaded && !isLoadingModel) {
			// Check if (window as any).Module is already whisperModule, if so, autoLoad
			if (whisperModule && whisperModule.FS_createDataFile) {
				autoLoadDefaultModel();
			}
		}
	});

	// React to WASM readiness if it becomes ready after mount
	$: if (
		isWasmReady &&
		whisperModule &&
		!internalIsModelLoaded &&
		!isLoadingModel &&
		!currentSelectedModelName
	) {
		// Added !currentSelectedModelName to prevent re-triggering if a model was being loaded
		autoLoadDefaultModel();
	}

	function log(text: string, type: 'info' | 'error' | 'warn' = 'info') {
		dispatch('log', { text, type });
	}

	async function autoLoadDefaultModel() {
		if (!isWasmReady || !whisperModule) {
			log('WASM not ready for auto model load.', 'error');
			dispatch('notify', { type: 'error', message: 'WASM not ready for auto model load.' });
			return;
		}

		isLoadingModel = true;
		currentSelectedModelName = DEFAULT_MODEL_NAME;
		internalModelStatus = `Auto-loading ${DEFAULT_MODEL_NAME}...`;
		modelLoadProgress = 0;
		log(`Attempting to auto-load model: ${DEFAULT_MODEL_PATH}`);

		try {
			const response = await fetch(DEFAULT_MODEL_PATH);
			if (!response.ok) {
				throw new Error(`Failed to fetch ${DEFAULT_MODEL_PATH}: ${response.statusText}`);
			}
			const contentLength = response.headers.get('content-length');
			const totalSize = contentLength ? parseInt(contentLength, 10) : 0;
			let loadedSize = 0;
			const reader = response.body?.getReader();
			if (!reader) {
				throw new Error('Failed to get reader for model response body.');
			}
			const chunks: Uint8Array[] = [];
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				if (value) {
					chunks.push(value);
					loadedSize += value.length;
					if (totalSize > 0) {
						modelLoadProgress = Math.round((loadedSize / totalSize) * 100);
						internalModelStatus = `Auto-loading ${DEFAULT_MODEL_NAME}: ${modelLoadProgress}%`;
					} else {
						internalModelStatus = `Auto-loading ${DEFAULT_MODEL_NAME} (loaded ${loadedSize} bytes)...`;
					}
					dispatch('statusUpdate', internalModelStatus);
				}
			}
			const modelDataArray = new Uint8Array(loadedSize);
			let offset = 0;
			for (const chunk of chunks) {
				modelDataArray.set(chunk, offset);
				offset += chunk.length;
			}
			log(
				`${DEFAULT_MODEL_NAME} fetched. Size: ${modelDataArray.length} bytes. Storing in WASM FS...`
			);
			internalModelStatus = `Storing ${DEFAULT_MODEL_NAME} in WASM FS...`;
			dispatch('statusUpdate', internalModelStatus);
			try {
				whisperModule.FS_unlink(MODEL_FILENAME_IN_FS);
			} catch (e) {
				/* Ignore */
			}
			whisperModule.FS_createDataFile('/', MODEL_FILENAME_IN_FS, modelDataArray, true, true, true);
			log(`${DEFAULT_MODEL_NAME} stored as ${MODEL_FILENAME_IN_FS} in WASM FS.`);
			initializeWhisperContext(DEFAULT_MODEL_NAME);
		} catch (error: any) {
			log(`Error auto-loading ${DEFAULT_MODEL_NAME}: ${error.message}`, 'error');
			internalModelStatus = `Failed to auto-load ${DEFAULT_MODEL_NAME}. Please select a model manually.`;
			dispatch('statusUpdate', internalModelStatus);
			isLoadingModel = false;
			dispatch('notify', { type: 'error', message: `Failed to auto-load model: ${error.message}` });
		}
	}

	async function fetchAndStoreModel(modelKey: keyof typeof models) {
		if (!isWasmReady || !(window as any).loadRemote) {
			log('WASM not ready or loadRemote not available. Cannot fetch model.', 'error');
			dispatch('notify', { type: 'error', message: 'WASM not ready or loadRemote not available.' });
			return;
		}
		isLoadingModel = true;
		modelLoadProgress = 0;
		currentSelectedModelName = modelKey;
		internalModelStatus = `Fetching ${modelKey}...`;
		dispatch('statusUpdate', internalModelStatus);
		log(`Fetching model: ${modelKey}`);

		const modelInfo = models[modelKey];
		const url = modelInfo.url;
		const size_mb = modelInfo.size;

		const cbProgress = (p: number) => {
			modelLoadProgress = Math.round(p * 100);
			internalModelStatus = `Downloading ${modelKey}: ${modelLoadProgress}%`;
			dispatch('statusUpdate', internalModelStatus);
		};
		const cbReady = (_fname_dst: string, data: Uint8Array) => {
			log(`Model ${modelKey} downloaded. Size: ${data.length} bytes. Storing in WASM FS...`);
			internalModelStatus = `Storing ${modelKey} in WASM FS...`;
			dispatch('statusUpdate', internalModelStatus);
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
			internalModelStatus = `Download cancelled: ${modelKey}`;
			dispatch('statusUpdate', internalModelStatus);
			isLoadingModel = false;
		};
		(window as any).loadRemote(
			url,
			MODEL_FILENAME_IN_FS, // fname_dst is not used by this cbReady, but helpers.js might use it
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

		if (!isWasmReady || !whisperModule) {
			log('WASM not ready. Cannot load model file.', 'error');
			dispatch('notify', { type: 'error', message: 'WASM not ready.' });
			return;
		}
		isLoadingModel = true;
		modelLoadProgress = 0;
		currentSelectedModelName = file.name;
		internalModelStatus = `Loading ${file.name}...`;
		dispatch('statusUpdate', internalModelStatus);
		log(`Loading model from file: ${file.name}, size: ${file.size} bytes`);

		const reader = new FileReader();
		reader.onload = (e) => {
			const buffer = e.target?.result as ArrayBuffer;
			if (buffer) {
				const data = new Uint8Array(buffer);
				log(`Model file ${file.name} read. Storing in WASM FS...`);
				internalModelStatus = `Storing ${file.name} in WASM FS...`;
				dispatch('statusUpdate', internalModelStatus);
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
				internalModelStatus = 'Error reading model file.';
				dispatch('statusUpdate', internalModelStatus);
				isLoadingModel = false;
				dispatch('notify', { type: 'error', message: 'Error reading model file.' });
			}
		};
		reader.onprogress = (e_progress) => {
			if (e_progress.lengthComputable) {
				modelLoadProgress = Math.round((e_progress.loaded / e_progress.total) * 100);
				internalModelStatus = `Reading ${file.name}: ${modelLoadProgress}%`;
				dispatch('statusUpdate', internalModelStatus);
			}
		};
		reader.readAsArrayBuffer(file);
	}

	function initializeWhisperContext(modelName: string) {
		if (!whisperModule) {
			log('Whisper module not available for context initialization.', 'error');
			isLoadingModel = false;
			return;
		}
		log(
			`Initializing Whisper context with model in FS: ${MODEL_FILENAME_IN_FS} (originally ${modelName})`
		);
		internalModelStatus = `Initializing Whisper with ${modelName}...`;
		dispatch('statusUpdate', internalModelStatus);

		try {
			// Free previous context if any (though App.svelte should handle this on changeModelRequest)
			if (internalWhisperContextId !== null) {
				whisperModule.free(internalWhisperContextId);
				log(`Freed previous context from ModelLoader: ${internalWhisperContextId}`);
				internalWhisperContextId = null;
			}

			const ctxId = whisperModule.init(MODEL_FILENAME_IN_FS);
			if (ctxId && ctxId > 0) {
				internalWhisperContextId = ctxId;
				internalIsModelLoaded = true;
				isLoadingModel = false;
				currentSelectedModelName = modelName; // Ensure this is set
				internalModelStatus = `Model "${modelName}" loaded & initialized. Context ID: ${ctxId}`;
				dispatch('statusUpdate', internalModelStatus);
				log(`Whisper context initialized successfully. Context ID: ${ctxId}`);
				dispatch('notify', { type: 'success', message: `Model "${modelName}" loaded!` });
				dispatch('modelInitialized', { contextId: ctxId, modelName: modelName });
			} else {
				throw new Error(`Initialization returned invalid context ID: ${ctxId}`);
			}
		} catch (e: any) {
			log(`Error initializing Whisper context: ${e.message}`, 'error');
			console.error('Whisper init error:', e);
			internalModelStatus = `Error initializing model: ${modelName}. ${e.message}`;
			dispatch('statusUpdate', internalModelStatus);
			internalIsModelLoaded = false;
			isLoadingModel = false;
			dispatch('notify', { type: 'error', message: `Failed to initialize model: ${e.message}` });
		}
	}

	function handleChangeModelClick() {
		// Free context locally if it was managed here, then notify App
		if (whisperModule && internalWhisperContextId !== null) {
			try {
				whisperModule.free(internalWhisperContextId);
				log(`Freed context ${internalWhisperContextId} from ModelLoader before change request.`);
			} catch (e) {
				log(`Error freeing context in ModelLoader: ${e}`, 'error');
			}
			internalWhisperContextId = null;
		}
		internalIsModelLoaded = false;
		isLoadingModel = false;
		currentSelectedModelName = '';
		internalModelStatus = 'No model loaded. Please select or upload a model.';
		dispatch('statusUpdate', internalModelStatus);
		dispatch('modelUnloaded');
	}
</script>

<div class={cardClasses}>
	<div class={cardHeaderClasses}>
		<h2 class={cardTitleClasses}>Step 1: Load Whisper Model</h2>
		<p class="{cardDescriptionClasses} mt-1">{internalModelStatus}</p>
	</div>
	<div class={cardContentClasses}>
		{#if isWasmLoading}
			<div class="flex items-center space-x-2">
				<div
					class="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
				></div>
				<span>Loading WASM runtime... Please wait.</span>
			</div>
			<progress value={modelLoadProgress} max="100" class={svelteProgressClasses}></progress>
		{:else if !isWasmReady}
			<p class="text-red-500">WASM Runtime failed to load. Check console for errors.</p>
		{:else if isLoadingModel}
			<progress value={modelLoadProgress} max="100" class={svelteProgressClasses}></progress>
			<p>Loading: {currentSelectedModelName} - {modelLoadProgress}%</p>
		{:else if !internalIsModelLoaded}
			<p>Auto-load failed or no model loaded. Please select a model manually:</p>
			<div class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
				{#each Object.entries(models) as [key, model]}
					<button
						class={outlineButtonClasses}
						on:click={() => fetchAndStoreModel(key as keyof typeof models)}
						disabled={isLoadingModel || !isWasmReady}
					>
						{key} ({model.size} MB)
					</button>
				{/each}
			</div>
			<div class="mt-4">
				<label for="model-file-upload" class={labelClasses}>Or upload a .bin model file:</label>
				<input
					type="file"
					id="model-file-upload"
					accept=".bin"
					class="{inputClasses} mt-1"
					on:change={handleModelFileSelect}
					disabled={isLoadingModel || !isWasmReady}
				/>
			</div>
		{:else}
			<!-- internalIsModelLoaded is true -->
			<p class="text-green-600">
				Model "{currentSelectedModelName}" is loaded and ready! Context ID: {internalWhisperContextId}
			</p>
			<button class="{outlineButtonClasses} mt-2" on:click={handleChangeModelClick}>
				Change Model
			</button>
		{/if}
	</div>
</div>
