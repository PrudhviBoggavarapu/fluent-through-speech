<!-- src/lib/components/guided/LessonBriefing.svelte -->
<script lang="ts">
	import { lessonStore } from '$lib/stores/lessonStore';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import type { Story } from '$lib/constants';

	let { lesson }: { lesson: Story } = $props();
</script>

<!-- FIX: Changed to fill available space -->
<div class="h-full w-full">
	<!-- FIX: Added flex classes to make the card fill the height -->
	<Card class="flex h-full flex-col bg-slate-800 text-slate-100">
		<CardHeader>
			<CardTitle class="text-center text-3xl font-bold">{lesson.title}</CardTitle>
			<CardDescription class="text-center text-slate-400">Lesson Briefing</CardDescription>
		</CardHeader>
		<!-- FIX: Added flex-1 and overflow-y-auto to make content scrollable -->
		<CardContent class="flex flex-1 flex-col justify-between space-y-6 overflow-y-auto">
			<div class="space-y-6">
				<div>
					<h3 class="mb-2 text-xl font-semibold text-purple-300">Scenario</h3>
					<p class="text-slate-300">{lesson.englishDescription}</p>
				</div>
				<div>
					<h3 class="mb-2 text-xl font-semibold text-purple-300">Full Text Preview</h3>
					<div class="max-h-60 overflow-y-auto rounded-md bg-slate-900/50 p-4 text-slate-300">
						<p>{lesson.content}</p>
					</div>
				</div>
			</div>
			<div class="pt-4 text-center">
				<Button
					onclick={() => lessonStore.beginPractice()}
					size="lg"
					class="bg-purple-600 text-lg text-white hover:bg-purple-500"
				>
					Begin Sentence Practice
				</Button>
			</div>
		</CardContent>
	</Card>
</div>
