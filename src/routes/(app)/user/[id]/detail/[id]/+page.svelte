<script lang="ts">
	import { goto } from '$app/navigation';
	import uphLogo from '$lib/assets/images/uph_logo.jpg';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import DataTableBadgeCell from '$lib/components/ui/data-table/data-table-badge-cell.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { ArrowLeft, FileText } from 'lucide-svelte';
	import { Stretch } from 'svelte-loading-spinners';
	import { toast } from 'svelte-sonner';
	import { fileProxy, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { requestDbStatusEnum, requestEnumColor } from '../../../../home/request-user-schema';
	import type { PageData } from './$types';
	import { approveRejectSchema } from './user-detail-schema';

	let { data }: { data: PageData } = $props();

	const processArray = ['Date of Approval', 'Date of Process', 'Date of Completion'];
	const processCaptionArray = ['(By Head of Department)', '(By Admin)', '(By Admin)'];

	let loading = $state(false);

	const form = superForm(data.form, {
		validators: zodClient(approveRejectSchema),
		dataType: 'json',
		onResult: ({ result }) => {
			console.log(result);

			if (result.type == 'failure') {
				toast.error(result.data?.message, {
					position: 'top-right',
					dismissable: true
				});
			} else if (result.type == 'success') {
				toast.success(result.data?.form.message, {
					position: 'top-right',
					dismissable: true
				});
			}
			loading = false;
		},
		onSubmit: () => {
			loading = true;
		}
	});

	const { form: formData, enhance } = form;
	let file = fileProxy(form, 'approvalFile', { empty: undefined });
	let rejectFile = fileProxy(form, 'rejectFile', { empty: undefined });

	let isMobile = $state(false);
	let windowWidth = $state(0);
	$effect(() => {
		if (windowWidth > 1000) {
			isMobile = false;
		} else {
			isMobile = true;
		}
	});
</script>

<button
	class="mx-10 my-5 flex rounded-md bg-uphButton p-3 text-white"
	onclick={() => {
		loading = true;
		goto('/home');
	}}
>
	<ArrowLeft />
	<span>Back</span>
</button>

<svelte:window bind:innerWidth={windowWidth} />
<div class="mx-10 my-10 rounded-md border-2 bg-uph p-5 md:h-[600px] lg:h-[600px]">
	<div class="mb-10">
		<Card.Root>
			<Card.Content class="flex items-center justify-between">
				<div class="flex flex-col gap-3">
					<Card.Title>Request Detail</Card.Title>
					<Card.Description class="text-xl"
						>Request that are Submitted By <strong>{data.userData?.username}</strong> With Request
						ID :
						<strong>{data.requestData?.request_code}</strong></Card.Description
					>
				</div>
				<div class="flex justify-between">
					{#if data.requestData}
						<DataTableBadgeCell
							value={data.requestData?.status.split('_').join(' ') ?? ''}
							className={requestEnumColor[
								data.requestData.status.split('_').join(' ') as keyof typeof requestDbStatusEnum
							]}
						></DataTableBadgeCell>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>
	</div>
	<div
		class="request-card flex items-center justify-between gap-10 sm:flex-col md:flex-col md:overflow-x-scroll lg:flex-row lg:overflow-x-scroll"
	>
		{#if !isMobile}
			<img
				src={uphLogo}
				alt="logo_uph"
				class="rounded-full sm:hidden md:hidden lg:block lg:w-[200px]"
			/>
		{/if}

		<div class="w-full md:h-[550px] lg:h-[400px]">
			<Card.Root>
				<Card.Header>
					<Card.Title>Applicant's Detail</Card.Title>
					<Card.Description class="pb-3">Applicant's who Submitted this Request</Card.Description>
				</Card.Header>
				<Separator />
				<Card.Content>
					<div
						class={`flex h-[250px] flex-row justify-between lg:w-[800px] ${isMobile ? 'overflow-scroll' : ''}`}
					>
						<div class="flex flex-col gap-4 lg:w-[450px]">
							<Label class="text-2xl">
								<div class="flex items-center justify-between">
									<span>NIM</span>
									<span class="lg:w-[250px]"> : {data.userData?.email.split('@')[0]}</span>
								</div>
							</Label>
							<Label class="text-2xl">
								<div class="flex items-center justify-between">
									<span>Name </span>
									<span class="text-gray-700 lg:w-[250px]"> : {data.userData?.username} </span>
								</div>
							</Label>
							<Label class="text-2xl">
								<div class="flex items-center justify-between">
									<div class="flex flex-col">
										<span>Email </span>
										<span>(Informatics)</span>
									</div>
									<span class="lg:w-[250px]"> : {data.userData?.email}</span>
								</div>
							</Label>
							<Label class="text-2xl">
								<div class="flex items-center justify-between">
									<div class="flex flex-col">
										<span>File </span>
									</div>
									<a
										class="text-[#3e74c5] lg:w-[250px]"
										href={data.requestData?.form_url}
										target="_blank"><FileText /></a
									>
								</div>
							</Label>
							{#if data.requestData?.reason}
								<Label class="text-2xl">
									<div class="flex items-center justify-between text-red-500">
										<span>Reject Reason</span>
										<span class="lg:w-[250px]"> : {data.requestData.reason}</span>
									</div>
								</Label>
							{/if}
						</div>
						<div class={`lg:w-[300px] ${isMobile ? 'w-[400px]' : ''}`}>
							{#if loading && data.requestData}
								<div class="mx-10 mb-4 flex h-10 flex-col gap-3">
									<span>Loading</span>
									<Stretch color="#314986" />
								</div>
							{:else}
								<form action="?/submit" method="post" enctype="multipart/form-data" use:enhance>
									<input type="hidden" name="process" bind:value={$formData.process} />
									<input type="hidden" name="studentId" bind:value={$formData.studentId} />
									{#if (data.requestData?.status == 'PENDING' && data.user?.roleCode == 'HOD') || (data.requestData?.status == 'ONGOING' && data.user?.roleCode == 'ADM') || (data.requestData?.status == 'PROCESSING' && data.user?.roleCode == 'ADM')}
										<Tabs.Root value="account" class="flex flex-col justify-between">
											<Tabs.List class="grid w-full grid-cols-2">
												<Tabs.Trigger value="approve"
													><strong class="">
														{#if data.requestData.status == 'ONGOING'}
															<span>Process</span>
														{:else if data.requestData.status == 'PROCESSING'}
															<span>Complete Process</span>
														{:else}
															<span>Aprove</span>
														{/if}
													</strong></Tabs.Trigger
												>
												<Tabs.Trigger value="reject"><strong class="">Reject</strong></Tabs.Trigger>
											</Tabs.List>
											<Tabs.Content value="approve">
												<Card.Root>
													{#if data.requestData.status != 'ONGOING' && data.requestData.status != 'PENDING'}
														<Card.Content class="space-y-2">
															<div class="space-y-1">
																<Label for="approvalFile">Approval Form</Label>
																<input
																	id="approvalFile"
																	type="file"
																	accept="application/pdf"
																	bind:files={$file}
																	name="approvalFile"
																	disabled={($rejectFile.length != 0 || $formData.reason != '') &&
																		data.requestData.status == 'PROCESSING'}
																/>
															</div>
														</Card.Content>
													{/if}
													<Card.Footer
														class={`${data.requestData.status == 'ONGOING' || data.requestData.status == 'PENDING' ? 'flex items-center justify-center pt-5' : ''}`}
													>
														<Button
															disabled={(($file.length == 0 ||
																($rejectFile.length != 0 && $formData.reason != '')) &&
																data.requestData.status == 'PROCESSING') ||
																(data.requestData.status == 'ONGOING' &&
																	($rejectFile.length != 0 || $formData.reason != '')) ||
																(data.requestData.status == 'PENDING' &&
																	($rejectFile.length != 0 || $formData.reason != '')) ||
																loading}
															type="submit"
															>{#if data.requestData.status == 'ONGOING'}
																<span>Process</span>
															{:else if data.requestData.status == 'PROCESSING'}
																<span>Complete</span>
															{:else}
																<span>Aprove</span>
															{/if}
															Application
														</Button>
													</Card.Footer>
												</Card.Root>
											</Tabs.Content>
											<!-- {#if data.requestData.status == 'PROCESSING'} -->
											<Tabs.Content value="reject">
												<Card.Root>
													<Card.Content class="space-y-2">
														<div class="space-y-1">
															<Label for="reason">Reason</Label>
															<Input
																id="reason"
																type="text"
																placeholder="Reason of Rejection"
																bind:value={$formData.reason}
																name="reason"
																disabled={$file.length != 0 &&
																	data.requestData.status == 'PROCESSING'}
															/>
														</div>
														<div class="space-y-1">
															<Label for="reason">Rejection File</Label>
															<input
																id="rejectFile"
																name="rejectFile"
																type="file"
																accept="application/pdf"
																bind:files={$rejectFile}
																disabled={$file.length != 0 &&
																	data.requestData.status == 'PROCESSING'}
															/>
														</div>
													</Card.Content>
													<Card.Footer>
														<Button
															disabled={($rejectFile.length == 0 &&
																$formData.reason == '' &&
																data.requestData.status == 'ONGOING') ||
																(data.requestData.status == 'PROCESSING' &&
																	($file.length != 0 ||
																		($rejectFile.length == 0 && $formData.reason == ''))) ||
																loading ||
																(data.requestData.status == 'PENDING' &&
																	$rejectFile.length == 0 &&
																	$formData.reason == '')}
															type="submit"
															onclick={() => {
																$formData.process = 'REJECT';
															}}>Reject Application</Button
														>
													</Card.Footer>
												</Card.Root>
											</Tabs.Content>
											<!-- {/if} -->
										</Tabs.Root>
									{/if}
								</form>
							{/if}
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
<div class="mx-10 mb-10">
	<Card.Root>
		<Card.Header>
			<Card.Title>Process</Card.Title>
			<Card.Description class="pb-4"
				>From Submitting Application until Receiving Requested Document</Card.Description
			>
		</Card.Header>
		<Separator />
		<Card.Content>
			<div class="flex flex-row gap-5">
				<Label class="s">
					<div class="flex flex-col items-start justify-between gap-2">
						<span class="text-2xl">Date of Submission</span>
						<span class="flex flex-col">
							<span class="text-2xl"
								>{data.requestData?.created_at
									? `${new Date(data.requestData.created_at).toLocaleDateString('id-ID', {
											day: '2-digit',
											month: 'short',
											year: 'numeric'
										})}`
									: ''}</span
							>
						</span>
					</div>
				</Label>
				<div class={`flex justify-between ${isMobile ? 'flex-col' : 'flex-row'} gap-10`}>
					{#if data.requetsHistoryData}
						{#each data.requetsHistoryData as historyData, idx}
							<Label class="text-2xl">
								<div class="flex flex-col items-start justify-between gap-2">
									<div class="flex">
										<span class="text-2xl"
											>{processArray[idx]}<sub>{processCaptionArray[idx]}</sub></span
										>
									</div>
									<span class="flex flex-row gap-3">
										<span
											>{historyData.created_at
												? `${new Date(historyData.created_at).toLocaleDateString('id-ID', {
														day: '2-digit',
														month: 'short',
														year: 'numeric'
													})}`
												: 'No Data'}</span
										>
										{#if data.requestData.status == 'COMPLETED' && idx == data.requetsHistoryData.length - 1}
											<a
												class="text-green-500 lg:w-[250px]"
												href={data.requestData.completion_file_url}
												target="_blank"
												><span class="flex gap-5">
													<FileText />
													<DataTableBadgeCell
														value={requestDbStatusEnum[data.requestData.status]}
														className="bg-green-500 text-white w-[90px] h-[30px]"
													></DataTableBadgeCell>
												</span></a
											>
										{:else if data.requestData.status == 'REJECTED' && idx == data.requetsHistoryData.length - 1}
											<a
												class="text-red-500 lg:w-[250px]"
												href={data.requestData.completion_file_url}
												target="_blank"
											>
												<span class="flex gap-5">
													{#if data.requestData.completion_file_url.length > 0}
														<FileText />
													{/if}
													<DataTableBadgeCell
														value={requestDbStatusEnum[data.requestData.status]}
														className="bg-red-500 text-white w-[90px] h-[30px]"
													></DataTableBadgeCell>
												</span>
											</a>
										{/if}
									</span>
								</div>
							</Label>
						{/each}
					{/if}
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>

<style>
	.request-card::-webkit-scrollbar {
		height: 0px;
	}
</style>
