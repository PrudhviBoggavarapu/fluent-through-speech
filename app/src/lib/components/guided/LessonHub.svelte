<!-- src/lib/components/guided/LessonHub.svelte -->
<script lang="ts">
	import { lessonStore } from '$lib/stores/lessonStore';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import type { Story } from '$lib/constants';
	import { onMount } from 'svelte';
	import { getAllCompletedLessonIds } from '$lib/services/db';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';

	let { lessons }: { lessons: readonly Story[] } = $props();

	let completedLessonIds = $state(new Set<string>());

	onMount(async () => {
		completedLessonIds = await getAllCompletedLessonIds();
	});
</script>

<!-- FIX: Changed to fill available space -->
<div class="h-full w-full">
	<!-- FIX: Added flex classes to make the card fill the height -->
	<Card class="flex h-full flex-col bg-slate-800 text-slate-100">
		<CardHeader>
			<CardTitle class="text-center text-3xl font-bold">Guided Lessons</CardTitle>
		</CardHeader>
		<!-- FIX: Added flex-1 and overflow-y-auto to make content scrollable -->
		<CardContent class="flex-1 overflow-y-auto">
			<p class="mb-6 text-center text-slate-400">
				Select a lesson to begin your structured practice.
			</p>
			<div class="space-y-3">
				{#each lessons as lesson (lesson.id)}
					<Button
						onclick={() => lessonStore.startLesson(lesson)}
						variant="outline"
						class="w-full justify-start border-slate-700 bg-slate-700/50 p-6 text-left hover:bg-slate-700"
					>
						<div class="flex-1">
							<p class="text-lg font-semibold text-slate-100">{lesson.title}</p>
							<p class="text-sm text-slate-400">
								{lesson.category} - {lesson.difficulty}
							</p>
						</div>
						{#if completedLessonIds.has(lesson.id)}
							<CheckCircle2 class="h-5 w-5 text-emerald-400" />
						{/if}
					</Button>
				{/each}
			</div>
		</CardContent>
	</Card>
</div>