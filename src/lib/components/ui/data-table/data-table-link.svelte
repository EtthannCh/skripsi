<script lang="ts">
	let { url }: { url: string } = $props();
</script>

<div>
	<a href={`${url}`} target="_blank" class="hover:underline">Link PDF</a>
</div>
