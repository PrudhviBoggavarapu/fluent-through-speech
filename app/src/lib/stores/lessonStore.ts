// src/lib/stores/lessonStore.ts
import { writable } from 'svelte/store';
import { splitParagraphIntoSentences } from '$lib/stores/utils/sentenceSplitter';
import type { Story } from '$lib/constants';
import { stories } from '$lib/constants';

export type LessonPhase = 'hub' | 'briefing' | 'practice' | 'recital' | 'complete';

interface LessonState {
    phase: LessonPhase;
    lessons: readonly Story[];
    currentLesson: Story | null;
    currentLessonIndex: number;
    sentences: string[];
    currentSentenceIndex: number;
}

const initialState: LessonState = {
    phase: 'hub',
    lessons: stories,
    currentLesson: null,
    currentLessonIndex: -1,
    sentences: [],
    currentSentenceIndex: -1
};

const { subscribe, set, update } = writable<LessonState>(initialState);

export const lessonStore = {
    subscribe,
    startLesson: (lesson: Story) => {
        const lessonIndex = stories.findIndex((s) => s.id === lesson.id);
        update((s) => ({
            ...s,
            phase: 'briefing',
            currentLesson: lesson,
            currentLessonIndex: lessonIndex
        }));
    },
    beginPractice: () => {
        update((s) => {
            if (!s.currentLesson) return s;
            const sentences = splitParagraphIntoSentences(s.currentLesson.content);
            return {
                ...s,
                phase: 'practice',
                sentences,
                currentSentenceIndex: 0
            };
        });
    },
    advanceSentence: () => {
        update((s) => {
            if (s.currentSentenceIndex < s.sentences.length - 1) {
                return { ...s, currentSentenceIndex: s.currentSentenceIndex + 1 };
            }
            // If it's the last sentence, stay on it until user proceeds to recital
            return s;
        });
    },
    startRecital: () => {
        update((s) => ({ ...s, phase: 'recital' }));
    },
    finishLesson: () => {
        update((s) => ({ ...s, phase: 'complete' }));
    },
    startNextLesson: () => {
        update((s) => {
            const nextIndex = s.currentLessonIndex + 1;
            if (nextIndex < s.lessons.length) {
                const nextLesson = s.lessons[nextIndex];
                return {
                    ...s,
                    phase: 'briefing',
                    currentLesson: nextLesson,
                    currentLessonIndex: nextIndex,
                    sentences: [],
                    currentSentenceIndex: -1
                };
            }
            // If no next lesson, go back to hub
            return { ...initialState };
        });
    },
    returnToHub: () => {
        set(initialState);
    }
};