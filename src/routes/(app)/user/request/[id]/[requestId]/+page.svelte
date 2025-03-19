<script lang="ts">
	import { Stretch } from 'svelte-loading-spinners';
	import type { PageData } from './$types';
	import { FileText } from 'lucide-svelte';

	let { data, requestCode }: { data: PageData; requestCode: string } = $props();
	const processArray = ['Approved By : ', 'Processed By : ', 'Delivered By : '];
</script>

<div>
	<h1 class="text-xl">Request Code : {requestCode}</h1>
	{#if data && data.userRequestHistory}
		<div class="mt-5 flex flex-col gap-5">
			{#each data.userRequestHistory.slice(0, 2) ?? [] as history, idx}
				<span>{processArray[idx]}{history.created_by}</span>
			{/each}
		</div>
		{#if data.userApprovalOrRejectFileUrl.status != 'PENDING'}
			<div class="mt-5 flex flex-col gap-5">
				<span
					>{processArray[2]}{data.userRequestHistory[data.userRequestHistory.length - 1]
						.created_by}</span
				>
				{#if (data.userApprovalOrRejectFileUrl.completion_file_url != '' || data.userApprovalOrRejectFileUrl.reason != '') && (data.userApprovalOrRejectFileUrl.status == 'COMPLETED' || data.userApprovalOrRejectFileUrl.status == 'REJECTED')}
					{#if data.userApprovalOrRejectFileUrl.completion_file_url != ''}
						<a
							class="flex items-center gap-5 lg:w-[250px]"
							href={data.userApprovalOrRejectFileUrl.completion_file_url}
							target="_blank"
							>{data.userApprovalOrRejectFileUrl.status == 'COMPLETED'
								? 'Approval File : '
								: data.userApprovalOrRejectFileUrl.status == 'REJECTED'
									? 'Need to Make Changes : '
									: ''}
							<FileText />
						</a>
					{/if}
				{:else}
					<span>Still In Process</span>
				{/if}
				{#if data.userApprovalOrRejectFileUrl.reason != ''}
					<span class="text-red-600">Reject Reason : {data.userApprovalOrRejectFileUrl.reason}</span
					>
				{/if}
			</div>
		{/if}
	{:else}
		<div class="mx-10 mb-4 h-10">
			<Stretch color="#314986" />
		</div>
	{/if}
</div>
