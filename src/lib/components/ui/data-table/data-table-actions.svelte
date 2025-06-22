<script lang="ts">
	import { EllipsisIcon } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { goto, invalidateAll } from '$app/navigation';

	let { id, url }: { id: string; url: string } = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
				<span class="sr-only">Open menu</span>
				<EllipsisIcon />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Actions</DropdownMenu.Label>
			<DropdownMenu.Item
				onclick={() => {
					goto(url, { invalidateAll: true });
				}}
			>
				See Details
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
	</DropdownMenu.Content>
</DropdownMenu.Root>
