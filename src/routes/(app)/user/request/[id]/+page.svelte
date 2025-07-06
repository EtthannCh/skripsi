<script lang="ts">
	import { goto, preloadData, pushState } from '$app/navigation';
	import { navigating, page } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import { createSvelteTable, renderComponent } from '$lib/components/ui/data-table';
	import DataTableBadgeCell from '$lib/components/ui/data-table/data-table-badge-cell.svelte';
	import DataTableMultipleRowCell from '$lib/components/ui/data-table/data-table-multiple-row-cell.svelte';
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { cn } from '$lib/utils';
	import {
		getCoreRowModel,
		getExpandedRowModel,
		type ColumnDef,
		type PaginationState,
		type TableOptions
	} from '@tanstack/table-core';
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import { Circle } from 'svelte-loading-spinners';
	import { MediaQuery } from 'svelte/reactivity';
	import {
		requestDbStatusCombobox,
		requestDbStatusEnum,
		requestEnumColor
	} from '../../../home/request-user-schema';
	import type { PageData } from './$types';
	import RequestDetailPage from './[requestId]/+page.svelte';
	import type { TableDataType } from './user-request-schema';
	import DataTableActions from '$lib/components/ui/data-table/data-table-actions.svelte';

	let { data }: { data: PageData } = $props();

	const isDesktop = new MediaQuery('(min-width: 768px)');
	const perPage = $derived(isDesktop.current ? 6 : 6);
	const siblingCount = $derived(isDesktop.current ? 1 : 0);
	const fetchPreloadData = async (requestId: number) => {
		const url = `${page.url.pathname}/${requestId}`;
		const result = await preloadData(url);
		if (result.type == 'loaded') {
			pushState(url, { preloadedData: result.data });
		} else {
			goto(url);
		}
	};

	let pagesFilter: number = $state(0);
	$effect.root(() => {
		const pagesParam = page.url.searchParams.get('pages') ?? 0;
		pagesFilter = Number(pagesParam);
	});

	$effect(() => {
		if (page.state.preloadedData != null) {
			openDetailSheet = false;
		}
	});

	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
	let requestCode = $state('');
	let triggerRef = $state<HTMLButtonElement>(null!);
	let open = $state(false);
	let statusValue = $state('');
	let selectedValue = $derived(requestDbStatusCombobox.find((f) => f.value === statusValue)?.label);
	let requestId: number = $state(0);

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}

	const filterHandler = () => {
		goto(`${page.url.pathname}?pages=${pagesFilter}&status=${statusValue}`, {
			invalidateAll: true
		});
	};

	let windowWidth = $state(0);
	let openDetailSheet = $state(false);

	let isMobile = $state(false);
	$effect(() => {
		if (windowWidth > 1000) {
			isMobile = false;
		} else {
			isMobile = true;
		}
	});

	let dataTableData: TableDataType[] = $derived(
		data.data.userRequestFromDb.map((v) => {
			return {
				id: v.id,
				requestCode: v.request_code,
				status: v.status,
				formCode: v.form_db.code,
				formName: v.form_db.name,
				submissionDate: v.created_at
			};
		})
	);

	const columns: ColumnDef<TableDataType>[] = [
		{
			id: 'expander',
			size: 50
		},
		{
			id: 'requestCode',
			header: 'Request Code',
			accessorKey: 'requestCode',
			accessorFn: (row) => row.requestCode,

			size: 50,
			cell: ({ row }) => {
				return row.original.requestCode;
			}
		},
		{
			id: 'status',
			header: 'Status',
			accessorKey: 'status',
			accessorFn: (row) => row.status,
			size: 50,
			cell: ({ row }) => {
				return renderComponent(DataTableBadgeCell, {
					value: requestDbStatusEnum[row.original.status],
					className: `${requestEnumColor[row.original.status]} max-w-[150px]`
				});
			}
		},
		{
			id: 'formCode',
			header: 'Form Code',
			accessorKey: 'formCode',
			size: 50,
			accessorFn: (row) => row.formCode,
			cell: ({ row }) => {
				return row.original.formCode.replace('_', '-');
			}
		},
		{
			id: 'formName',
			header: 'Form Name',
			accessorKey: 'formName',
			accessorFn: (row) => row.formName,
			cell: ({ row }) => {
				return row.original.formName;
			}
		},
		{
			id: 'submissionDate',
			header: 'Submission Date',
			accessorKey: 'submissionDate',
			accessorFn: (row) => row.submissionDate,
			cell: ({ row }) => {
				return renderComponent(DataTableMultipleRowCell, {
					value: new Date(row.original.submissionDate).toLocaleDateString('id-ID', {
						day: '2-digit',
						month: 'short',
						year: 'numeric'
					}),
					value1: new Date(row.original.submissionDate).toLocaleTimeString()
				});
			}
		},
		{
			id: 'actions',
			cell: ({ row }) => {
				return renderComponent(DataTableActions, {
					requestHandler: async () => {
						requestCode = row.original.requestCode;
						await fetchPreloadData(row.original.id);
					}
				});
			}
		}
	];

	const options: TableOptions<TableDataType> = {
		get data() {
			return dataTableData;
		},
		columns,
		getCoreRowModel: getCoreRowModel(),
		getExpandedRowModel: getExpandedRowModel()
	};

	const table = createSvelteTable(options);
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class={`wrapper-1 w-full overflow-x-scroll pl-10 ${isMobile ? '' : 'mt-5'}`}>
	<div class={`flex items-center gap-5 pb-5 ${isMobile ? 'w-[260px]' : ''}`}>
		<Popover.Root bind:open>
			<Popover.Trigger bind:ref={triggerRef}>
				{#snippet child({ props })}
					<Button
						variant="outline"
						class="justify-between max-md:w-full max-sm:w-full sm:w-full md:w-full lg:w-[200px]"
						{...props}
						role="combobox"
						aria-expanded={open}
					>
						{selectedValue || 'Choose Status'}
						<ChevronsUpDown class="opacity-50" />
					</Button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content class="w-[200px] p-0">
				<Command.Root>
					<Command.Input placeholder="Choose Status..." />
					<Command.List>
						<Command.Group>
							{#each requestDbStatusCombobox as status}
								<Command.Item
									value={status.value}
									onSelect={() => {
										if (statusValue && statusValue == status.value) {
											statusValue = '';
										} else {
											statusValue = status.value;
										}

										closeAndFocusTrigger();
									}}
								>
									<Check class={cn(statusValue !== status.value && 'text-transparent')} />
									{status.label}
								</Command.Item>
							{/each}
						</Command.Group>
					</Command.List>
				</Command.Root>
			</Popover.Content>
		</Popover.Root>
		<button
			class={`flex h-10 items-center justify-center gap-3 rounded-md bg-uphButton p-3 ${navigating.to != null ? 'text-gray-400' : 'text-white'}`}
			onclick={() => {
				filterHandler();
			}}
			disabled={navigating.to != null}
		>
			{#if navigating.to || openDetailSheet}
				<div>
					<Circle size="27" color={navigating.to != null ? 'grey' : '#fff'} />
				</div>
			{/if}
			Filter</button
		>
	</div>
	<DataTable
		data={dataTableData}
		{columns}
		className="bg-white p-5 mr-10 rounded-md"
		headerClass="bg-uphButton text-white"
	></DataTable>
	<div
		class={`wrapper-1 grid overflow-scroll ${windowWidth < 700 ? 'grid-cols-1 gap-36 ' : ''} ${windowWidth > 1300 ? ' grid-cols-3 gap-10' : ''} ${windowWidth < 1300 && windowWidth > 700 ? 'grid-cols-2 gap-24 ' : ''} place-items-center`}
	>
		<!-- {#each data.data.userRequestFromDb as userRequest}
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
										>Submission Date : {new Date(userRequest.created_at).toLocaleDateString(
											'id-ID',
											{ day: '2-digit', month: 'short', year: 'numeric' }
										)}</span
									>
									<Button
										variant="outline"
										onclick={() => {
											fetchPreloadData(userRequest.id);
											requestCode = userRequest.request_code;
											openDetailSheet = true;
										}}>Detail</Button
									>
								</div>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		{/each} -->

		<Sheet.Root open={page.state.preloadedData != null}>
			<Sheet.Content
				side="right"
				onInteractOutside={() => {
					window.history.back();
				}}
				onClose={() => {
					window.history.back();
				}}
			>
				<Sheet.Header>
					<Sheet.Title class="pb-5 text-3xl">Process Details</Sheet.Title>
				</Sheet.Header>
				<RequestDetailPage isMainPage={false} data={page.state.preloadedData} {requestCode} />
			</Sheet.Content>
		</Sheet.Root>
	</div>
	<!-- <div
		class="sticky bottom-0 mx-auto my-5 flex w-[400px] items-center justify-center rounded-full bg-white py-2"
	>
		<Pagination.Root count={data.data.totalCount ?? 0} {perPage} {siblingCount}>
			{#snippet children({ pages })}
				<Pagination.Content>
					<Pagination.Item>
						<Pagination.PrevButton
							onclick={() => {
								pagesFilter -= 1;
								filterHandler();
							}}
						>
							<ChevronLeft class="size-4" />
							<span class="hidden sm:block">Previous</span>
						</Pagination.PrevButton>
					</Pagination.Item>
					{#each pages as page (page.key)}
						{#if page.type === 'ellipsis'}
							<Pagination.Item>
								<Pagination.Ellipsis />
							</Pagination.Item>
						{:else}
							<Pagination.Item>
								<Pagination.Link
									{page}
									isActive={pagesFilter + 1 === page.value}
									onclick={() => {
										pagesFilter = Number(page.value) - 1;
										filterHandler();
									}}
								>
									{page.value}
								</Pagination.Link>
							</Pagination.Item>
						{/if}
					{/each}
					<Pagination.Item>
						<Pagination.NextButton
							disabled={data.data.userRequestFromDb.length == 0}
							onclick={() => {
								pagesFilter += 1;
								filterHandler();
							}}
						>
							<span class="hidden sm:block">Next</span>
							<ChevronRight class="size-4" />
						</Pagination.NextButton>
					</Pagination.Item>
				</Pagination.Content>
			{/snippet}
		</Pagination.Root>
	</div> -->
</div>

<style>
	.wrapper-1::-webkit-scrollbar {
		display: none;
	}
</style>
