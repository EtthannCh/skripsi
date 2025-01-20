<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

{#if data.data.length > 0}
	{#each data.data as a}
		<div class="my-5 flex flex-col">
			<span>{a.id}</span>
			<span>{a.first_approver_name ?? 'Belum Disetujui Oleh Pihak Pertama'}</span>
			<span>{a.status}</span>
		</div>
	{/each}
{:else}
	<span>No Data</span>
{/if}
