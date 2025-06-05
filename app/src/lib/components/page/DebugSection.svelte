<script lang="ts">
	import ModelLoader from '$lib/components/whisper/ModelLoader.svelte';
	import LogViewer from '$lib/components/whisper/LogViewer.svelte';

	type $$Props = {
		whisperModule: any;
		isWasmReady: boolean;
		isWasmLoading: boolean;
		preferredLanguage: string;
		initialModelStatus: string;
		onLog: (event: CustomEvent<{ text: string; type?: 'info' | 'error' | 'warn' }>) => void;
		onNotify: (
			event: CustomEvent<{ type: 'success' | 'error' | 'info' | 'warning'; message: string }>
		) => void;
		onModelInitialized: (event: CustomEvent<{ contextId: number; modelName: string }>) => void;
		onModelUnloaded: () => void;
		onModelStatusUpdate: (event: CustomEvent<string>) => void;
		logOutput: string;
		class?: string; // Added class prop
	};

	let {
		whisperModule,
		isWasmReady,
		isWasmLoading,
		preferredLanguage,
		initialModelStatus,
		onLog,
		onNotify,
		onModelInitialized,
		onModelUnloaded,
		onModelStatusUpdate,
		logOutput,
		class: className // Destructured class prop
	}: $$Props = $props();
</script>

<div
	class="mx-auto mt-10 w-full max-w-3xl space-y-6 border-t-2 border-dashed border-slate-700 pt-6 {className}"
>
	<h3 class="text-center text-lg font-semibold text-slate-400">
		Whisper Engine & Model Controls (Debug)
	</h3>
	<ModelLoader
		{whisperModule}
		{isWasmReady}
		{isWasmLoading}
		{preferredLanguage}
		{initialModelStatus}
		on:log={onLog}
		on:notify={onNotify}
		on:modelInitialized={onModelInitialized}
		on:modelUnloaded={onModelUnloaded}
		on:statusUpdate={onModelStatusUpdate}
	/>
	<LogViewer {logOutput} />
</div>
