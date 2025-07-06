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
	<div class="mt-4 p-4">
		<h1 class="mb-6 text-center text-4xl font-semibold">Package status</h1>
		<div class="container max-h-[500px] overflow-y-scroll">
			<div class="grid-cols-12 flex-col text-gray-50 md:grid">
				<div class="md:contents">
					<div
						class="col-start-4 col-end-12 my-4 w-full rounded-xl bg-yellow-300 p-4 shadow-md"
					>
						<h3 class="mb-1 text-lg font-semibold">Approved By</h3>
						<p class="w-full text-justify leading-tight">Kaprodi</p>
					</div>
				</div>

				<div class="flex md:contents">
					<div class="relative col-start-2 col-end-4 mr-10 md:mx-auto">
						<div class="flex h-full w-6 items-center justify-center">
							<div class="pointer-events-none h-full w-1 bg-green-500"></div>
						</div>
						<div
							class="absolute top-1/2 -mt-3 h-6 w-6 rounded-full bg-green-500 text-center shadow"
						>
							<i class="fas fa-check-circle text-white"></i>
						</div>
					</div>
					<div
						class="col-start-4 col-end-12 my-4 mr-auto w-full rounded-xl bg-green-500 p-4 shadow-md"
					>
						<h3 class="mb-1 text-lg font-semibold">Out for Delivery</h3>
						<p class="text-justify leading-tight">22 July 2021, 01:00 PM</p>
					</div>
				</div>

				<div class="flex md:contents">
					<div class="relative col-start-2 col-end-4 mr-10 md:mx-auto">
						<div class="flex h-full w-6 items-center justify-center">
							<div class="pointer-events-none h-full w-1 bg-red-500"></div>
						</div>
						<div class="absolute top-1/2 -mt-3 h-6 w-6 rounded-full bg-red-500 text-center shadow">
							<i class="fas fa-times-circle text-white"></i>
						</div>
					</div>
					<div
						class="col-start-4 col-end-12 my-4 mr-auto w-full rounded-xl bg-red-500 p-4 shadow-md"
					>
						<h3 class="mb-1 text-lg font-semibold text-gray-50">Cancelled</h3>
						<p class="text-justify leading-tight">Customer cancelled the order</p>
					</div>
				</div>

				<div class="flex md:contents">
					<div class="relative col-start-2 col-end-4 mr-10 md:mx-auto">
						<div class="flex h-full w-6 items-center justify-center">
							<div class="pointer-events-none h-full w-1 bg-gray-300"></div>
						</div>
						<div class="absolute top-1/2 -mt-3 h-6 w-6 rounded-full bg-gray-300 text-center shadow">
							<i class="fas fa-exclamation-circle text-gray-400"></i>
						</div>
					</div>
					<div
						class="col-start-4 col-end-12 my-4 mr-auto w-full rounded-xl bg-gray-300 p-4 shadow-md"
					>
						<h3 class="mb-1 text-lg font-semibold text-gray-400">Delivered</h3>
						<p class="text-justify leading-tight"></p>
					</div>
				</div>
			</div>
		</div>
	</div>
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
