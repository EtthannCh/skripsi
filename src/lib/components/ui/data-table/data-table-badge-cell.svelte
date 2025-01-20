<script lang="ts">
	import Badge from '../badge/badge.svelte';

	let { value, className }: { value: string; className: string } = $props();
</script>

<Badge class={`pointer-events-none rounded-md p-3 ${className} flex items-center justify-center`}
	>{value}</Badge
>
