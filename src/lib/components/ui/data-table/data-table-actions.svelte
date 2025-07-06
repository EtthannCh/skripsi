<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { EllipsisIcon } from 'lucide-svelte';

	let { url, requestHandler }: { url?: string; requestHandler?: () => void } =
		$props();
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
					if (requestHandler) {
						requestHandler();
					} else {
						goto(url ?? '', { invalidateAll: true });
					}
				}}
			>
				See Details
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
	</DropdownMenu.Content>
</DropdownMenu.Root>
