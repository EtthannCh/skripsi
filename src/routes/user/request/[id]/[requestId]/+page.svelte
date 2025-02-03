<script lang="ts">
	import { Stretch } from 'svelte-loading-spinners';
	import type { PageData } from './$types';

	let { data, requestCode }: { data: PageData; requestCode: string } = $props();
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
	<h1>{requestCode}</h1>
	{#if data && data.userRequestHistory}
		{#each data.userRequestHistory ?? [] as history, idx}
			<span>{processArray[idx]} : {history.created_by}</span>
		{/each}
	{:else}
		<div class="mx-10 mb-4 h-10">
			<Stretch color="#314986" />
		</div>
	{/if}
</div>
