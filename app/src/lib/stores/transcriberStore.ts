// src/lib/stores/transcriberStore.ts
import { writable, get, type Writable } from 'svelte/store';
import { workerMessages, postToWorker, workerError } from '$lib/workerService';
import Constants from '$lib/utils/Constants'; // Ensure this path is correct

export interface ProgressItem {
	file: string;
	loaded: number;
	progress: number;
	total: number;
	name: string;
	status: string;
}

export interface TranscribedChunk {
	text: string;
	timestamp: [number, number | null];
}

export interface TranscriberData {
	isBusy: boolean;
	text: string;
	chunks: TranscribedChunk[];
}

// --- State Stores ---
export const model = writable<string>(Constants.DEFAULT_MODEL);
export const subtask = writable<string>(Constants.DEFAULT_SUBTASK);
export const quantized = writable<boolean>(Constants.DEFAULT_QUANTIZED);
export const multilingual = writable<boolean>(Constants.DEFAULT_MULTILINGUAL);
export const language = writable<string>(Constants.DEFAULT_LANGUAGE);

export const transcriptOutput = writable<TranscriberData | undefined>(undefined);
export const isTranscribing = writable(false); // Renamed from isBusy for clarity
export const isModelLoading = writable(false);
export const progressItems = writable<ProgressItem[]>([]);
export const transcriptionError = writable<string | null>(null);

// --- Actions ---
export function onInputChange(): void {
	transcriptOutput.set(undefined);
	transcriptionError.set(null);
}

export async function startTranscription(audioDataBuffer: AudioBuffer | undefined): Promise<void> {
	if (audioDataBuffer) {
		transcriptOutput.set(undefined);
		isTranscribing.set(true);
		isModelLoading.set(false); // Reset model loading state
		progressItems.set([]);
		transcriptionError.set(null);

		let audio_pcm_f32: Float32Array;
		if (audioDataBuffer.numberOfChannels === 2) {
			const SCALING_FACTOR = Math.sqrt(2);
			const left = audioDataBuffer.getChannelData(0);
			const right = audioDataBuffer.getChannelData(1);
			audio_pcm_f32 = new Float32Array(left.length);
			for (let i = 0; i < audioDataBuffer.length; ++i) {
				audio_pcm_f32[i] = (SCALING_FACTOR * (left[i] + right[i])) / 2;
			}
		} else {
			audio_pcm_f32 = audioDataBuffer.getChannelData(0);
		}

		postToWorker({
			audio: audio_pcm_f32,
			model: get(model),
			multilingual: get(multilingual),
			quantized: get(quantized),
			subtask: get(multilingual) ? get(subtask) : null,
			language: get(multilingual) && get(language) !== 'auto' ? get(language) : null
		});
	}
}

// --- Worker Message Handling ---
workerMessages.subscribe((message) => {
	if (!message) return;

	switch (message.status) {
		case 'progress':
			progressItems.update((prev) =>
				prev.map((item) =>
					item.file === message.file ? { ...item, progress: message.progress ?? 0 } : item
				)
			);
			break;
		case 'update':
			const updateData = message.data as [string, { chunks: TranscribedChunk[] }];
			transcriptOutput.set({
				isBusy: true,
				text: updateData[0],
				chunks: updateData[1].chunks
			});
			break;
		case 'complete':
			const completeData = message.data as { text: string; chunks: TranscribedChunk[] };
			transcriptOutput.set({
				isBusy: false,
				text: completeData.text,
				chunks: completeData.chunks
			});
			isTranscribing.set(false);
			break;
		case 'initiate':
			isModelLoading.set(true);
			// Ensure message has file, name, and status for ProgressItem
			if (message.file && message.name && message.status) {
				progressItems.update((prev) => [
					...prev,
					{
						file: message.file,
						loaded: message.loaded || 0,
						progress: message.progress || 0,
						total: message.total || 0,
						name: message.name,
						status: message.status
					}
				]);
			}
			break;
		case 'ready':
			isModelLoading.set(false);
			break;
		case 'error':
			isTranscribing.set(false);
			isModelLoading.set(false);
			const errorMessage =
				message.data?.message ||
				'Worker error. Check console. Safari on M1/M2 Mac might cause issues.';
			transcriptionError.set(errorMessage);
			console.error('Transcription error from worker:', message.data);
			break;
		case 'done':
			progressItems.update((prev) => prev.filter((item) => item.file !== message.file));
			if (get(progressItems).length === 0) {
				isModelLoading.set(false); // Ensure loading is false if all files are done
			}
			break;
		default:
			break;
	}
});

workerError.subscribe((err) => {
	if (err) {
		isTranscribing.set(false);
		isModelLoading.set(false);
		transcriptionError.set(err.message || 'An unexpected worker error occurred.');
	}
});