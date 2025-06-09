<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import ParagraphInput from '$lib/components/ParagraphInput.svelte';
	import { labelClasses, selectClasses as regularSelectClasses } from '$lib/uiClasses';
	import type { Story } from '$lib/constants';

	type $$Props = {
		story: Story;
		selectedLanguage?: string;
		languageOptions: Array<{ value: string; label: string }>;
		onPracticeStart: () => void;
		isWhisperBusy?: boolean;
	};

	let {
		story,
		selectedLanguage = $bindable('es'),
		languageOptions,
		onPracticeStart,
		isWhisperBusy = false
	}: $$Props = $props();
</script>

<Card class="mx-auto w-full max-w-3xl bg-slate-800 text-slate-100 shadow-xl">
	<CardHeader>
		<CardTitle class="text-center text-3xl font-bold text-slate-100">{story.title}</CardTitle>
		<CardDescription class="text-center text-slate-400">
			Category: {story.category} | Difficulty: {story.difficulty}
		</CardDescription>
	</CardHeader>
	<CardContent class="mt-4">
		<div class="mb-6">
			<label
				for="global-language-select"
				class="{labelClasses} mb-2 block text-lg font-medium text-slate-300"
			>
				Select Language for Practice:
			</label>
			<select
				id="global-language-select"
				bind:value={selectedLanguage}
				class="{regularSelectClasses} w-full border-slate-600 bg-slate-700 text-slate-100 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
				disabled={isWhisperBusy}
			>
				{#each languageOptions as lang (lang.value)}
					<option value={lang.value}>{lang.label}</option>
				{/each}
			</select>
			<p class="mt-2 text-xs text-slate-400">
				This language will be used for model loading and transcription.
			</p>
		</div>

		{#if story && story.content}
			<ParagraphInput
				initialParagraph={story.content}
				on:practiceStarted={onPracticeStart}
				disabled={isWhisperBusy}
			/>
		{:else}
			<div
				class="flex min-h-[200px] items-center justify-center rounded-md border border-dashed border-slate-700 bg-slate-700/50 p-4"
			>
				<p class="text-slate-400">Select a story to begin.</p>
			</div>
		{/if}
		<div class="mt-8 rounded-lg border border-dashed border-slate-700 p-4 text-center">
			<p class="text-slate-400">✨ Tip: Speak clearly and at a natural pace. ✨</p>
		</div>
	</CardContent>
</Card>
