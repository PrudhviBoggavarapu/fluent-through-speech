// src/lib/workerService.ts
import { writable, type Writable } from 'svelte/store';

export interface WorkerMessage {
	status: string;
	// Add other properties based on messages from your worker.js
	file?: string;
	progress?: number;
	data?: any;
	task?: string;
	[key: string]: any;
}

export const workerMessages: Writable<WorkerMessage | null> = writable(null);
export const workerError: Writable<Error | null> = writable(null);
let workerInstance: Worker | null = null;

export function getWorker(): Worker {
	if (!workerInstance) {
		// Ensure worker.js is in src/lib/ or adjust the path
		workerInstance = new Worker(new URL('./worker.js', import.meta.url), {
			type: 'module'
		});

		workerInstance.onmessage = (event: MessageEvent<WorkerMessage>) => {
			workerMessages.set(event.data);
		};

		workerInstance.onerror = (errorEvent: ErrorEvent) => {
			console.error('Worker error:', errorEvent.message, errorEvent);
			workerError.set(new Error(errorEvent.message || 'Worker failed'));
		};
	}
	return workerInstance;
}

export function postToWorker(message: any) {
	const worker = getWorker();
	worker.postMessage(message);
}

// Initialize worker when service is loaded
if (typeof window !== 'undefined') {
	getWorker();
}