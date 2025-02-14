<script lang="ts">
	import { goto } from '$app/navigation';
	import { navigating, page } from '$app/state';
	import uphLogo from '$lib/assets/images/uph_logo.jpg';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { ArrowLeft, FileText } from 'lucide-svelte';
	import { Stretch } from 'svelte-loading-spinners';
	import { toast } from 'svelte-sonner';
	import SuperDebug, { fileProxy, superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { requestDbStatusEnum, requestEnumColor } from '../../../../home/request-user-schema';
	import type { PageData } from './$types';
	import DataTableBadgeCell from '$lib/components/ui/data-table/data-table-badge-cell.svelte';
	import { approveRejectSchema } from './user-detail-schema';

	let { data }: { data: PageData } = $props();

	const handleActions = async (requestId: number, status: string, action: string) => {
		const response = await fetch(page.url.pathname, {
			method: 'post',
			body: JSON.stringify({
				status,
				requestId,
				action,
				reason
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (response.status.toString() == '200') {
			toast.success('Success', {
				position: 'top-right',
				dismissable: true
			});
		}
	};

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
	const form = superForm(data.form, {
		validators: zod(approveRejectSchema),
		dataType: 'json',
		onResult: ({ result }) => {
			goto(page.url.pathname, { invalidateAll: true });
		}
	});
	const { form: formData } = form;
	let file = fileProxy(form, 'approvalFile', { empty: undefined });
	let reason: string | undefined = $state('');
	let processType: string = $state('');
	$effect.root(() => {
		$formData.requestId = data.requestData?.id;
	});
</script>

<button
	class="mx-10 my-5 flex rounded-md bg-uphButton p-3 text-white"
	onclick={() => {
		goto('/home');
	}}
>
	<ArrowLeft />
	<span>Back</span>
</button>
{#if navigating.to}
	<div class="mx-10 mb-4 h-10">
		<Stretch color="#314986" />
	</div>
{/if}
<SuperDebug data={$formData}></SuperDebug>
<!-- {#if data.user?.roleId == 3} -->
<div class="mx-10 my-10 rounded-md border-2 bg-uph p-5 md:h-[600px] lg:h-[570px]">
	<div class="mb-10">
		<Card.Root>
			<Card.Content class="flex items-center justify-between">
				<div class="flex flex-col gap-3">
					<Card.Title>Request Detail</Card.Title>
					<Card.Description
						>Request that are Submitted By {data.userData?.username} With Request ID :
						<strong>{data.requestData?.id}</strong></Card.Description
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
	<div class="flex items-center justify-between gap-10">
		<img
			src={uphLogo}
			alt="logo_uph"
			class="rounded-full sm:hidden md:hidden lg:block lg:w-[300px]"
		/>

		<div class="w-full overflow-x-scroll md:h-[200px] lg:h-[400px]">
			<Card.Root>
				<Card.Header>
					<Card.Title>Applicant's Detail</Card.Title>
					<Card.Description>Applicants who Submitted this Request</Card.Description>
				</Card.Header>
				<Separator />
				<Card.Content>
					<div class="flex h-[250px] flex-row justify-between gap-5 lg:w-[800px]">
						<div class="flex flex-col gap-5 lg:w-[450px]">
							<Label class="text-lg">
								<div class="flex items-center justify-between">
									<span>NIM</span>
									<span class="lg:w-[250px]"> : {data.userData?.email.split('@')[0]}</span>
								</div>
							</Label>
							<Label class="text-lg">
								<div class="flex items-center justify-between">
									<span>Name </span>
									<span class="text-gray-700 lg:w-[250px]"> : {data.userData?.username} </span>
								</div>
							</Label>
							<Label class="text-lg">
								<div class="flex items-center justify-between">
									<div class="flex flex-col">
										<span>Email </span>
										<span>(Informatics)</span>
									</div>
									<span class="lg:w-[250px]"> : {data.userData?.email}</span>
								</div>
							</Label>
							<Label class="text-lg">
								<div class="flex items-center justify-between">
									<div class="flex flex-col">
										<span>File </span>
									</div>
									<a class="lg:w-[250px]" href={data.requestData?.form_url} target="_blank"
										><FileText /></a
									>
								</div>
							</Label>
							{#if data.requestData?.reason}
								<Label class="text-lg">
									<div class="flex items-center justify-between text-red-500">
										<span>Reject Reason</span>
										<span class="lg:w-[250px]"> : {data.requestData.reason}</span>
									</div>
								</Label>
							{/if}
						</div>
						<div class="lg:w-[300px]">
							<form action="?/submit" method="post" enctype="multipart/form-data">
								<input type="hidden" name="status" value={data.requestData?.status} />
								<input type="hidden" name="requestId" bind:value={$formData.requestId} />
								<input type="hidden" name="process" bind:value={$formData.process} />
								{#if (data.requestData?.status == 'PENDING' && data.user?.roleId == 1) || (data.requestData?.status == 'ONGOING' && data.user?.roleId == 2) || (data.requestData?.status == 'PROCESSING' && data.user?.roleId == 2)}
									<Tabs.Root value="account" class="flex flex-col justify-between">
										<Tabs.List class="grid w-full grid-cols-2">
											<Tabs.Trigger value="approve"
												><strong class="text-black">
													{#if data.requestData.status == 'ONGOING'}
														<span>Process</span>
													{:else if data.requestData.status == 'PROCESSING'}
														<span>Complete Process</span>
													{:else}
														<span>Aprove</span>
													{/if}
												</strong></Tabs.Trigger
											>
											<Tabs.Trigger value="reject"
												><strong class="text-black">Reject</strong></Tabs.Trigger
											>
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
															/>
														</div>
													</Card.Content>
												{/if}
												<Card.Footer>
													<Button
														disabled={!$file && data.requestData.status == 'PROCESSING'}
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
																(data.requestData.status == 'PROCESSING' ||
																	data.requestData.status == 'ONGOING')}
														/>
													</div>
												</Card.Content>
												<Card.Footer>
													<Button
														disabled={$file.length != 0 &&
															(data.requestData.status == 'PROCESSING' ||
																data.requestData.status == 'ONGOING')}
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
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
<div class=" mx-10 md:h-[300px]">
	<Card.Root>
		<Card.Header>
			<Card.Title>Process</Card.Title>
			<Card.Description
				>From Submitting Application until Receiving Requested Document</Card.Description
			>
		</Card.Header>
		<Separator />
		<Card.Content>
			<div class="flex flex-row gap-5">
				<Label class="text-lg">
					<div class="flex flex-col items-start justify-between gap-5">
						<span class="text-xl">Date of Submission</span>
						<span class="flex flex-col">
							<span
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
				<div class="flex justify-between gap-6">
					{#if data.requetsHistoryData}
						{#each data.requetsHistoryData as historyData, idx}
							<Label class="text-lg ">
								<div class="flex flex-col items-start justify-between gap-5">
									<div class="flex flex-col">
										<span class="text-xl">{processArray[idx]}</span>
										<span class="text-sm">{processCaptionArray[idx]}</span>
									</div>
									<span class="flex flex-col">
										<span
											>{historyData.created_at
												? `${new Date(historyData.created_at).toLocaleDateString('id-ID', {
														day: '2-digit',
														month: 'short',
														year: 'numeric'
													})}`
												: 'No Data'}</span
										>
										{#if historyData.file_url}
											<span class="mt-3">
												<a class="lg:w-[250px]" href={historyData.file_url} target="_blank"
													><FileText /></a
												>
											</span>
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
<!-- {/if} -->
