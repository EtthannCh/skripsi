<script lang="ts">
	import type { RequestHistorySchema } from '../../../[id]/detail/[id]/user-detail-schema';
	
	let { data, requestId }: { data: RequestHistorySchema[]; requestId: number } = $props();
    const processArray = [
		'Date of Approval',
		'Date of Process',
		'Date of Completion',
		'Date Delivered'
	];
	const processCaptionArray = [
		'(By Head of Department)',
		'(By Admin)',
		'(By Admin)',
		'(To Student)'
	];
</script>

<div>
	{#each data as history, idx}
		<span>{processArray[idx]} : {history.created_by}</span>
	{/each}
</div>
