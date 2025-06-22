<script lang="ts">
	import * as HoverCard from '$lib/components/ui/hover-card/index.js';
	import { OctagonAlert, TriangleAlert } from 'lucide-svelte';

	let { type }: { type: string } = $props();
</script>

{#if type == 'alert'}
	<HoverCard.Root>
		<HoverCard.Trigger
			class="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black"
		>
			<TriangleAlert color="orange"></TriangleAlert>
		</HoverCard.Trigger>
		<HoverCard.Content class="w-80">
			<div class="flex justify-between space-x-4">
				<span>Over 3 Days... Please Process Immediately</span>
			</div>
		</HoverCard.Content>
	</HoverCard.Root>
{:else if type == 'danger'}
<HoverCard.Root>
		<HoverCard.Trigger
			class="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black"
		>
			<OctagonAlert color="red"></OctagonAlert>
		</HoverCard.Trigger>
		<HoverCard.Content class="w-80">
			<div class="flex justify-between space-x-4">
				<span>Over 5 Days... Please Process Immediately</span>
			</div>
		</HoverCard.Content>
	</HoverCard.Root>
{/if}
