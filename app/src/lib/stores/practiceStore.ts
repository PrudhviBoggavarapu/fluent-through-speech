// src/lib/stores/practiceStore.ts
import { writable } from 'svelte/store';
import { splitParagraphIntoSentences } from '$lib/stores/utils/sentenceSplitter';

// Simplified PracticeItem, only dealing with full sentences for now
export interface PracticeItem {
	text: string;
	type: 'sentence';
	originalSentenceIndex: number;
}

export type CurrentPracticeDisplayItem = PracticeItem | null;

interface PracticeState {
	paragraphInput: string;
	sentences: string[]; // Raw sentences from input
	currentSentenceIndex: number; // Index of the current sentence being practiced
	isPracticeMode: boolean;
}

const initialState: PracticeState = {
	paragraphInput: '',
	sentences: [],
	currentSentenceIndex: -1,
	isPracticeMode: false
};

const practiceStore = writable<PracticeState>(initialState);

export const resetPractice = () => {
	console.log('[Store] Resetting practice.');
	practiceStore.set(initialState);
};

export const startPractice = (paragraph: string) => {
	console.log('[Store] Starting practice with paragraph:', paragraph);

	const rawSentences = splitParagraphIntoSentences(paragraph);
	if (rawSentences.length === 0) {
		console.warn('[Store] No sentences found.');
		practiceStore.update((s) => ({
			...s,
			paragraphInput: paragraph,
			sentences: [],
			isPracticeMode: false,
			currentSentenceIndex: -1
		}));
		return;
	}

	practiceStore.set({
		paragraphInput: paragraph,
		sentences: rawSentences,
		currentSentenceIndex: 0,
		isPracticeMode: true
	});
	console.log('[Store] Practice started with sentences:', rawSentences);
};

export const advanceToNextPracticeItem = () => {
	practiceStore.update((state) => {
		if (!state.isPracticeMode || state.sentences.length === 0) {
			return state;
		}

		const nextSentenceIndex = state.currentSentenceIndex + 1;
		console.log(
			`[Store] Advancing. Current sentence index: ${state.currentSentenceIndex}, Next attempt: ${nextSentenceIndex}`
		);

		if (nextSentenceIndex < state.sentences.length) {
			console.log(`[Store] Next sentence: "${state.sentences[nextSentenceIndex]}"`);
			return { ...state, currentSentenceIndex: nextSentenceIndex };
		} else {
			console.log('[Store] Practice complete! No more sentences.');
			// Reset to initial state but keep paragraphInput if needed for review, or full reset.
			// For now, let's end practice mode and reset index.
			return { ...state, isPracticeMode: false, currentSentenceIndex: -1 };
		}
	});
};

export default practiceStore;