<!-- src/lib/components/guided/LessonComplete.svelte -->
<script lang="ts">
	import { lessonStore } from '$lib/stores/lessonStore';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';

	let hasNextLesson = $derived($lessonStore.currentLessonIndex < $lessonStore.lessons.length - 1);
</script>

<div class="mx-auto w-full max-w-xl text-center">
	<Card class="bg-slate-800 text-slate-100">
		<CardHeader>
			<div
				class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20"
			>
				<CheckCircle2 class="h-10 w-10 text-emerald-400" />
			</div>
			<CardTitle class="text-3xl font-bold">Lesson Complete!</CardTitle>
		</CardHeader>
		<CardContent class="space-y-6">
			<p class="text-lg text-slate-300">
				Excellent work on "{$lessonStore.currentLesson?.title}". You're one step closer to fluency.
			</p>
			<div class="flex justify-center gap-4">
				{#if hasNextLesson}
					<Button
						onclick={() => lessonStore.startNextLesson()}
						size="lg"
						class="bg-purple-600 text-lg text-white hover:bg-purple-500"
					>
						Start Next Lesson
					</Button>
				{/if}
				<Button
					onclick={() => lessonStore.returnToHub()}
					variant="outline"
					size="lg"
					class="border-slate-600 bg-slate-700 text-lg hover:bg-slate-600"
				>
					Return to Lesson Hub
				</Button>
			</div>
		</CardContent>
	</Card>
</div>
