<script lang="ts">
	import { lessonStore } from '$lib/stores/lessonStore';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import AudioRecorder from '$lib/components/AudioRecorder.svelte';
	import { kSampleRate, kMaxRecording_s } from '$lib/constants';
	import { toast } from 'svelte-sonner';
	import { diffWords, type DiffResult } from '$lib/utils/diff';
	import { Button } from '$lib/components/ui/button';
	import type { Story } from '$lib/constants';
	import { createEventDispatcher } from 'svelte';

	let {
		lesson,
		whisperModule,
		whisperContextId,
		isModelLoaded,
		numThreadsForTranscription = 8
	}: {
		lesson: Story;
		whisperModule: any;
		whisperContextId: number | null;
		isModelLoaded: boolean;
		numThreadsForTranscription?: number;
	} = $props();

	const dispatch = createEventDispatcher<{
		log: { text: string; type?: 'info' | 'error' | 'warn' };
	}>();

	let audioRecorderRef = $state<InstanceType<typeof AudioRecorder> | null>(null);
	let isTranscribing = $state(false);
	let transcriptionPollInterval: any = null;
	let rawTranscribedText = $state<string | null>(null);
	let diffResult = $state<DiffResult[]>([]);
	let accuracy = $state<number | null>(null);

	const paragraph = lesson.content;
	const languageForTranscription = lesson.lang ?? 'es';

	async function handleAudioProcessed(event: CustomEvent<{ pcmf32: Float32Array }>) {
		const audioPCM32 = event.detail.pcmf32;
		isTranscribing = true;
		rawTranscribedText = null;
		diffResult = [];
		accuracy = null;

		try {
			const ret = whisperModule.full_default(
				whisperContextId,
				audioPCM32,
				languageForTranscription,
				numThreadsForTranscription,
				false
			);
			if (ret !== 0) throw new Error(`Whisper C API returned error code: ${ret}`);

			transcriptionPollInterval = setInterval(() => {
				if (whisperModule.is_transcription_done(whisperContextId)) {
					clearInterval(transcriptionPollInterval);
					const transcribedText = whisperModule.get_transcription_result(whisperContextId);
					processRecitalResult(transcribedText);
					isTranscribing = false;
				}
			}, 500);
		} catch (e: any) {
			toast.error(`Transcription error: ${e.message}`);
			isTranscribing = false;
		}
	}

	function processRecitalResult(transcribed: string) {
		rawTranscribedText = transcribed;
		diffResult = diffWords(paragraph, transcribed);
		const correctWords = diffResult.filter((r) => r.type === 'correct').length;
		const totalOriginalWords = paragraph.trim().split(/\s+/).length;
		accuracy = (correctWords / totalOriginalWords) * 100;
		toast.success(`Recital complete! Accuracy: ${accuracy.toFixed(0)}%`);
	}
</script>

<div class="h-full w-full">
	<Card class="flex h-full flex-col bg-slate-800 text-slate-100">
		<CardHeader>
			<CardTitle class="text-center text-2xl font-bold">Full Recital</CardTitle>
			<p class="text-center text-slate-400">Great job! Now, try to say the entire paragraph.</p>
		</CardHeader>
		<CardContent class="flex flex-1 flex-col space-y-6 overflow-y-auto">
			<div class="max-h-60 overflow-y-auto rounded-md bg-slate-900/50 p-4 text-lg">
				<p>{paragraph}</p>
			</div>

			<div class="flex justify-center">
				<AudioRecorder
					bind:this={audioRecorderRef}
					maxRecordingSeconds={kMaxRecording_s}
					targetSampleRate={kSampleRate}
					disabled={!isModelLoaded || isTranscribing}
					on:processed={handleAudioProcessed}
					on:log={(e) => dispatch('log', e.detail)}
				/>
			</div>

			{#if rawTranscribedText !== null && accuracy !== null}
				<div class="flex-1 space-y-4 overflow-y-auto rounded-md border border-slate-700 p-4">
					<h3 class="text-xl font-semibold text-purple-300">Your Recital Analysis</h3>
					<div class="space-y-1">
						<h4 class="text-sm font-semibold tracking-wider text-slate-400 uppercase">
							Whisper heard:
						</h4>
						<p class="text-slate-300 italic">
							{#if rawTranscribedText}
								"{rawTranscribedText}"
							{:else}
								<span class="text-slate-400">(No speech detected)</span>
							{/if}
						</p>
					</div>
					<div class="space-y-1">
						<h4 class="text-sm font-semibold tracking-wider text-slate-400 uppercase">
							Comparison:
						</h4>
						<p class="text-lg font-bold">
							Accuracy: <span class="text-emerald-400">{accuracy.toFixed(0)}%</span>
						</p>
						<div class="rounded-md bg-slate-900/50 p-4 text-lg leading-relaxed">
							{#each diffResult as word}
								<span
									class:text-emerald-400={word.type === 'correct'}
									class:text-rose-500={word.type === 'incorrect'}
									class:line-through={word.type === 'incorrect'}
									class:text-amber-400={word.type === 'extra'}
									>{word.text}
								</span>
							{/each}
						</div>
					</div>
					<div class="pt-4 text-center">
						<Button
							onclick={() => lessonStore.finishLesson()}
							size="lg"
							class="bg-purple-600 text-lg text-white hover:bg-purple-500"
						>
							Finish Lesson
						</Button>
					</div>
				</div>
			{/if}
		</CardContent>
	</Card>
</div>
