<script lang="ts">
	import { goto, preloadData, pushState, replaceState } from '$app/navigation';
	import { navigating, page } from '$app/state';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import DataTableBadgeCell from '$lib/components/ui/data-table/data-table-badge-cell.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { ArrowLeft } from 'lucide-svelte';
	import { Stretch } from 'svelte-loading-spinners';
	import { requestEnumColor } from '../../../home/request-user-schema';
	import type { PageData } from './$types';
	import RequestDetailPage from './[requestId]/+page.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	let { data }: { data: PageData } = $props();

	const fetchPreloadData = async (requestId: number) => {
		console.log(page.url.pathname);
		const url = `${page.url.pathname}/${requestId}`;
		const result = await preloadData(url);

		if (result.type == 'loaded') {
			pushState(url, { preloadedData: result.data });
		} else {
			goto(url);
		}
	};
	let requestCode = $state('');
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
<div class="p-10 w-full">
	<div class="grid overflow-y-scroll sm:grid-cols-1 sm:gap-36 md:grid-cols-2 md:gap-24 lg:grid-cols-3 lg:gap-10">
		{#each data.data.userRequestFromDb as userRequest}
			<div class="w-[320px]">
				<Card.Root>
					<Card.Header>
						<Card.Title>{userRequest.request_code}</Card.Title>
						<Card.Description></Card.Description>
					</Card.Header>
					<Separator />
					<Card.Content>
						<DataTableBadgeCell
							className={`${requestEnumColor[userRequest.status]} mb-5`}
							value={userRequest.status}
						></DataTableBadgeCell>
						<div class="scrollbar-hidden flex flex-row gap-5">
							<div class="flex justify-between gap-6">
								<div class="flex flex-col gap-5">
									<span>Form Code : {userRequest.form_db.code.replace('_', '-')}</span>
									<span>Form Name : {userRequest.form_db.name}</span>
									<span
										>Tanggal Pengajuan : {new Date(userRequest.created_at).toLocaleDateString(
											'id-ID',
											{ day: '2-digit', month: 'short', year: 'numeric' }
										)}</span
									>
									<Button
										variant="outline"
										onclick={() => {
											fetchPreloadData(userRequest.id);
											requestCode = userRequest.request_code;
										}}>Detail</Button
									>
								</div>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		{/each}
		<Sheet.Root open={page.state.preloadedData != null}>
			<Sheet.Content side="right">
				<Sheet.Header>
					<Sheet.Title>Process Details</Sheet.Title>
				</Sheet.Header>
				<RequestDetailPage data={page.state.preloadedData} {requestCode}></RequestDetailPage>
			</Sheet.Content>
		</Sheet.Root>
	</div>
</div>
