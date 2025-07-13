<script lang="ts">
	import { goto } from '$app/navigation';
	import { ArrowLeft, FileText } from 'lucide-svelte';
	import { Stretch } from 'svelte-loading-spinners';
	import type { PageData } from './$types';
	import { Loader } from 'lucide-svelte';
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
	<div class="mt-6 grow sm:mt-8 lg:mt-0">
		<div
			class="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
		>
			<h3 class="text-xl font-semibold text-gray-900 dark:text-white">Order history</h3>

			<ol class="relative ms-3 border-s border-gray-200 dark:border-gray-700">
				<li class="mb-10 ms-6">
					<span
						class="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white dark:bg-gray-700 dark:ring-gray-800"
					>
						<svg
							class="h-4 w-4 text-gray-500 dark:text-gray-400"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"
							/>
						</svg>
					</span>
					<h4 class="mb-0.5 text-base font-semibold text-gray-900 dark:text-white">
						Estimated delivery in 24 Nov 2023
					</h4>
					<p class="text-sm font-normal text-gray-500 dark:text-gray-400">Products delivered</p>
				</li>

				<li class="mb-10 ms-6">
					<span
						class="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white dark:bg-gray-700 dark:ring-gray-800"
					>
						<svg
							class="h-4 w-4 text-gray-500 dark:text-gray-400"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 7h6l2 4m-8-4v8m0-8V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v9h2m8 0H9m4 0h2m4 0h2v-4m0 0h-5m3.5 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm-10 0a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
							/>
						</svg>
					</span>
					<h4 class="mb-0.5 text-base font-semibold text-gray-900 dark:text-white">Today</h4>
					<p class="text-sm font-normal text-gray-500 dark:text-gray-400">
						Products being delivered
					</p>
				</li>

				<li class="text-primary-700 dark:text-primary-500 mb-10 ms-6">
					<span
						class="bg-primary-100 dark:bg-primary-900 absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full ring-8 ring-white dark:ring-gray-800"
					>
						<svg
							class="h-4 w-4"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 11.917 9.724 16.5 19 7.5"
							/>
						</svg>
					</span>
					<h4 class="mb-0.5 font-semibold">23 Nov 2023, 15:15</h4>
					<p class="text-sm">Products in the courier's warehouse</p>
				</li>

				<li class="text-primary-700 dark:text-primary-500 mb-10 ms-6">
					<span
						class="bg-primary-100 dark:bg-primary-900 absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full ring-8 ring-white dark:ring-gray-800"
					>
						<svg
							class="h-4 w-4"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 11.917 9.724 16.5 19 7.5"
							/>
						</svg>
					</span>
					<h4 class="mb-0.5 text-base font-semibold">22 Nov 2023, 12:27</h4>
					<p class="text-sm">Products delivered to the courier - DHL Express</p>
				</li>

				<li class="text-primary-700 dark:text-primary-500 mb-10 ms-6">
					<span
						class="bg-primary-100 dark:bg-primary-900 absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full ring-8 ring-white dark:ring-gray-800"
					>
						<svg
							class="h-4 w-4"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 11.917 9.724 16.5 19 7.5"
							/>
						</svg>
					</span>
					<h4 class="mb-0.5 font-semibold">19 Nov 2023, 10:47</h4>
					<p class="text-sm">Payment accepted - VISA Credit Card</p>
				</li>

				<li class="text-primary-700 dark:text-primary-500 ms-6">
					<span
						class="bg-primary-100 dark:bg-primary-900 absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full ring-8 ring-white dark:ring-gray-800"
					>
						<svg
							class="h-4 w-4"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 11.917 9.724 16.5 19 7.5"
							/>
						</svg>
					</span>
					<div>
						<h4 class="mb-0.5 font-semibold">19 Nov 2023, 10:45</h4>
						<a href="#" class="text-sm font-medium hover:underline"
							>Order placed - Receipt #647563</a
						>
					</div>
				</li>
			</ol>

			<div class="gap-4 sm:flex sm:items-center">
				<button
					type="button"
					class="hover:text-primary-700 w-full rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
					>Cancel the order</button
				>

				<a
					href="#"
					class="bg-primary-700 hover:bg-primary-800 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 mt-4 flex w-full items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-4 sm:mt-0"
					>Order details</a
				>
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
