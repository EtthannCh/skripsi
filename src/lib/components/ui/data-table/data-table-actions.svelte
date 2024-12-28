<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	let { id, approveFunc, rejectFunc }: { id: string; approveFunc: () => {}; rejectFunc: () => {} } =
		$props();

	const handleApprove = () => {
		approveFunc();
	};

	const handleReject = () => {
		rejectFunc();
	};
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
				<span class="sr-only">Open menu</span>
				<Ellipsis class="size-4" />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Item class=" text-green-600" onclick={handleApprove}>Approve</DropdownMenu.Item>
		<DropdownMenu.Item class=" text-red-600" onclick={handleReject}>Reject</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
