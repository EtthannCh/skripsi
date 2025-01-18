<script lang="ts">
	import FormLegend from './../../../../../lib/components/ui/form/form-legend.svelte';
	import { goto } from '$app/navigation';
	import { navigating } from '$app/state';
	import uphLogo from '$lib/assets/images/uph_logo.jpg';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { ArrowLeft, User } from 'lucide-svelte';
	import { Stretch } from 'svelte-loading-spinners';
	import { toast } from 'svelte-sonner';
	import { fileProxy, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import type { PageData } from './$types';
	import { approveRejectSchema } from './user-detail-schema';
	import { page } from '$app/stores';
	import { FileText } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	const form = superForm(data.form, {
		validators: zodClient(approveRejectSchema),
		dataType: 'json'
	});

	const { form: formData, enhance } = form;
	const file = fileProxy(form, 'approvalFile');

	const handleActions = async (requestId: number, status: string, action: string) => {
		const response = await fetch($page.url.pathname, {
			method: 'post',
			body: JSON.stringify({
				status,
				requestId,
				action
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
		await goto('/home', { invalidateAll: true });
	};

	const processArray = [
		'Date of Approval (By Head of Department)',
		'Date of Process (By Admin)',
		'Date of Completion (By Admin)',
		'Date Delivered (To Student)'
	];
	let files: FileList | null = $state(null);
</script>

<button
	class="mx-10 my-5 flex rounded-md bg-uphButton p-3 text-white"
	onclick={() => {
		window.history.back();
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
					<Label class="text-lg"
						>Status : <strong>{data.requestData?.status.split('_').join(' ')}</strong></Label
					>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
	<div class="flex items-center justify-between">
		<img
			src={uphLogo}
			alt="logo_uph"
			class="rounded-full sm:hidden md:hidden lg:block lg:w-[300px]"
		/>
		<div class="md:h-[200px] lg:h-[400px]">
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
						</div>
						<div class="lg:w-[300px]">
							{#if (data.requestData?.status == 'PENDING' && data.user?.roleId == 1) || (data.requestData?.status == 'AWAITING_APPROVAL' && data.user?.roleId == 2)}
								<Tabs.Root value="account" class="flex flex-col justify-between">
									<Tabs.List class="grid w-full grid-cols-2">
										<Tabs.Trigger value="approve"
											><strong class="text-black">Approve</strong></Tabs.Trigger
										>
										<Tabs.Trigger value="reject"
											><strong class="text-black">Reject</strong></Tabs.Trigger
										>
									</Tabs.List>
									<Tabs.Content value="approve">
										<Card.Root>
											<Card.Content class="space-y-2">
												<div class="space-y-1">
													<Label for="approvalFile">Approval Form</Label>
													<Input
														id="approvalFile"
														type="file"
														accept="application/pdf"
														bind:value={files}
													/>
												</div>
											</Card.Content>
											<Card.Footer>
												<Button
													disabled={!files}
													onclick={() => {
														handleActions(
															data.requestData?.id ?? 0,
															data.requestData?.status ?? '',
															'APPROVE'
														);
													}}>Approve Application</Button
												>
											</Card.Footer>
										</Card.Root>
									</Tabs.Content>
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
													/>
												</div>
											</Card.Content>
											<Card.Footer>
												<Button>Reject Application</Button>
											</Card.Footer>
										</Card.Root>
									</Tabs.Content>
								</Tabs.Root>
							{/if}
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
			<div class="scrollbar-hidden flex flex-row gap-5">
				<Label class="text-lg">
					<div class="flex flex-col items-start justify-between gap-5">
						<span>Date of Submission</span>
						<span class="flex flex-col">
							<span
								>{data.requestData?.created_at
									? `${new Date(data.requestData.created_at).toLocaleDateString('id-ID', {
											day: '2-digit',
											month: 'short',
											year: 'numeric'
										})} (${new Date(data.requestData.created_at).toLocaleTimeString()})`
									: ''}</span
							>
						</span>
					</div>
				</Label>
				{#each data.requetsHistoryData ?? [] as historyData, idx}
					<Label class="text-lg">
						<div class="flex flex-col items-start justify-between gap-5">
							<span>{processArray[idx]}</span>
							<span class="flex flex-col">
								<span
									>{historyData.created_at
										? `${new Date(historyData.created_at).toLocaleDateString('id-ID', {
												day: '2-digit',
												month: 'short',
												year: 'numeric'
											})} (${new Date(historyData.created_at).toLocaleTimeString()})`
										: 'No Data'}</span
								>
								<span> {historyData.file_url} </span>
							</span>
						</div>
					</Label>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>
</div>
<!-- {/if} -->
