<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import type { Story } from '$lib/constants';

	type $$Props = {
		stories: readonly Story[];
		selectedStoryId?: string;
		showSidebar?: boolean;
	};

	let {
		stories,
		selectedStoryId = $bindable(''),
		showSidebar = $bindable(true)
	}: $$Props = $props();

	function handleStorySelect(storyId: string) {
		selectedStoryId = storyId;
		if (typeof window !== 'undefined' && window.innerWidth < 768) {
			showSidebar = false;
		}
	}
</script>

{#if showSidebar}
	<ScrollArea
		class="fixed inset-y-0 left-0 z-40 w-64 transform 
                   border-r border-slate-700 bg-slate-800/90 text-slate-300 shadow-lg transition-transform duration-300 ease-in-out 
                   md:static md:h-[calc(100vh-4rem-3rem)] md:shrink-0 md:transform-none md:transition-none 
                   {showSidebar ? 'translate-x-0' : '-translate-x-full'}"
	>
		<div
			class="h-full p-4 {showSidebar && typeof window !== 'undefined' && window.innerWidth < 768
				? 'pt-16'
				: 'md:pt-4'}"
		>
			<h2 class="mb-4 text-lg font-semibold tracking-tight text-slate-100">Choose Your Passage</h2>
			<ul class="space-y-1">
				{#each stories as story (story.id)}
					<li>
						<button
							onclick={() => handleStorySelect(story.id)}
							class="flex w-full items-center justify-between rounded-md p-2.5 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none
                                {selectedStoryId === story.id
								? 'bg-purple-500/20 font-medium text-purple-200'
								: 'hover:bg-slate-700 hover:text-slate-100'}"
						>
							<div class="flex-1">
								<p class="font-medium">{story.title}</p>
								<p class="text-xs text-slate-400">
									{story.category} - {story.difficulty}
								</p>
							</div>
							{#if selectedStoryId === story.id}
								<ChevronRightIcon class="h-5 w-5 text-purple-300" />
							{/if}
						</button>
					</li>
				{/each}
			</ul>
			<div class="mt-6 border-t border-slate-700 pt-4">
				<p class="text-xs text-slate-400">
					(Future: Filter by difficulty/category, search passages)
				</p>
			</div>
		</div>
	</ScrollArea>
{/if}