<!-- src/lib/components/guided/LessonHub.svelte -->
<script lang="ts">
	import { lessonStore } from '$lib/stores/lessonStore';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import type { Story } from '$lib/constants';

	let { lessons }: { lessons: readonly Story[] } = $props();
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
					</Button>
				{/each}
			</div>
		</CardContent>
	</Card>
</div>
