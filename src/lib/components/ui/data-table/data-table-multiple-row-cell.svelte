<script lang="ts">
	let { value, value1, value2 }: { value: string; value1?: string; value2?: string } = $props();
</script>

<div class="flex flex-col gap-3">
	<div>
		<span>{value}</span>
	</div>
	{#if value1}
		<div>
			<span>{value1}</span>
		</div>
	{/if}
	{#if value2}
		<div>
			<span>{value2}</span>
		</div>
	{/if}
</div>
