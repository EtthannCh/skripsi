<script lang="ts">
	let { url, label, blank }: { url: string; label: string; blank?: boolean } = $props();
</script>

<div>
	<a href={`${url}`} target={blank ? `_blank` : ''} class="underline hover:text-gray-400">{label}</a
	>
</div>
