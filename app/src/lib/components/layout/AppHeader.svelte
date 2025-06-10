<!-- src/lib/components/layout/AppHeader.svelte -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import UserCircleIcon from '@lucide/svelte/icons/user-circle-2';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import BookOpenTextIcon from '@lucide/svelte/icons/book-open-text';
	import BugIcon from '@lucide/svelte/icons/bug';
	import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';

	let {
		showSidebar = $bindable(true),
		showDebugInfo = $bindable(false)
	}: {
		showSidebar?: boolean;
		showDebugInfo?: boolean;
	} = $props();
</script>

<nav
	class="sticky top-0 z-50 flex h-16 items-center justify-between bg-slate-800/80 p-3 px-4 shadow-md backdrop-blur-md md:px-6"
>
	<div class="flex items-center gap-2">
		<Button
			variant="ghost"
			size="icon"
			class="text-slate-100 hover:bg-slate-700 md:hidden"
			onclick={() => (showSidebar = !showSidebar)}
		>
			<MenuIcon class="h-6 w-6" />
		</Button>
		<a href="/" class="flex items-center gap-2 text-slate-100 hover:text-purple-300">
			<BookOpenTextIcon class="h-8 w-8 text-purple-400" />
			<h1 class="text-xl font-semibold tracking-tight">FluentThroughSpeech</h1>
		</a>
	</div>
	<div class="flex items-center gap-2">
		<a href="/guided">
			<Button variant="ghost" class="text-slate-300 hover:bg-slate-700 hover:text-slate-100">
				<GraduationCapIcon class="mr-2 h-5 w-5" />
				Guided Mode
			</Button>
		</a>
		<Button
			variant="ghost"
			size="icon"
			title="User Profile (Coming Soon!)"
			class="text-slate-300 hover:bg-slate-700 hover:text-slate-100"
		>
			<UserCircleIcon class="h-6 w-6" />
		</Button>
		<Button
			variant="ghost"
			size="icon"
			title="Settings (Coming Soon!)"
			class="text-slate-300 hover:bg-slate-700 hover:text-slate-100"
		>
			<SettingsIcon class="h-6 w-6" />
		</Button>
		<Button
			variant="ghost"
			size="icon"
			title={showDebugInfo ? 'Hide Debug Info' : 'Show Debug Info'}
			class="text-slate-300 hover:bg-slate-700 hover:text-slate-100 {showDebugInfo
				? '!bg-purple-500/20 text-purple-400'
				: ''}"
			onclick={() => (showDebugInfo = !showDebugInfo)}
		>
			<BugIcon class="h-6 w-6" />
		</Button>
	</div>
</nav>
