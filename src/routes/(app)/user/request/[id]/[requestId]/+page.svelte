<script lang="ts">
	import { goto } from '$app/navigation';
	import { ArrowLeft, FileText } from 'lucide-svelte';
	import { Stretch } from 'svelte-loading-spinners';
	import type { PageData } from './$types';

	let {
		data,
		requestCode,
		isMainPage
	}: { data: PageData; requestCode: string; isMainPage: boolean } = $props();
	const processArray = ['Approved By : ', 'Processed By : ', 'Delivered By : '];

	let mainPage = isMainPage == false ? false : true;
</script>

<div
	class={`${mainPage ? 'wrapper-1 mx-auto flex h-[500px] max-w-[500px] flex-col justify-center overflow-x-scroll rounded-2xl bg-white' : ''}`}
>
	<h1 class={`text-xl ${mainPage ? ' flex flex-col items-center justify-center gap-5' : ''}`}>
		<span>Request Code : {requestCode ?? data.userApprovalOrRejectFileUrl.request_code}</span>
		<span
			>{mainPage && data.userRequestHistory[0]?.created_at != undefined
				? `Submission Date : ${new Date(data.userRequestHistory[0].created_at).toLocaleDateString(
						'id-ID',
						{
							day: '2-digit',
							month: 'long',
							year: 'numeric'
						}
					)}`
				: ''}</span
		>
	</h1>
	{#if data && data.userRequestHistory}
		<div class={`mt-5 flex flex-col ${mainPage ? 'mx-28' : ''} gap-5`}>
			{#each data.userRequestHistory.slice(0, 2) ?? [] as history, idx}
				<span>{processArray[idx]}{history.created_by}</span>
			{/each}
		</div>
		{#if data.userApprovalOrRejectFileUrl.status != 'PENDING'}
			<div class={`mt-5 flex flex-col gap-5 ${mainPage ? 'mx-28' : ''}`}>
				{#if (data.userApprovalOrRejectFileUrl.completion_file_url != '' || data.userApprovalOrRejectFileUrl.reason != '') && (data.userApprovalOrRejectFileUrl.status == 'COMPLETED' || data.userApprovalOrRejectFileUrl.status == 'REJECTED')}
					<span
						>{processArray[2]}{data.userRequestHistory[data.userRequestHistory.length - 1]
							.created_by}</span
					>
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
	<button
		class={`mx-auto my-5 flex w-[100px] rounded-md bg-uphButton p-3 text-white ${mainPage ? 'block' : 'hidden'}`}
		onclick={() => {
			goto(`/user/request/${data.user.id}`);
		}}
	>
		<ArrowLeft />
		<span>Back</span>
	</button>
</div>

<style>
	.wrapper-1::-webkit-scrollbar {
		display: none;
	}
</style>
