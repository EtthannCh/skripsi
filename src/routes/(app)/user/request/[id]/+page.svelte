<script lang="ts">
	import { goto } from '$app/navigation';
	import { navigating, page } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import { renderComponent } from '$lib/components/ui/data-table';
	import DataTableBadgeCell from '$lib/components/ui/data-table/data-table-badge-cell.svelte';
	import DataTableMultipleRowCell from '$lib/components/ui/data-table/data-table-multiple-row-cell.svelte';
	import DataTableSubRowTracking from '$lib/components/ui/data-table/data-table-sub-row-tracking.svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { cn } from '$lib/utils';
	import {
		getCoreRowModel,
		getExpandedRowModel,
		type ColumnDef,
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
	import type { TableDataType } from './user-request-schema';

	let { data }: { data: PageData } = $props();

	const isDesktop = new MediaQuery('(min-width: 768px)');
	const perPage = $derived(isDesktop.current ? 6 : 6);
	const siblingCount = $derived(isDesktop.current ? 1 : 0);
	const fetchPreloadData = async (requestId: number) => {
		const url = `${page.url.pathname}/fetch-history?requestId=${requestId}`;
		const response = await fetch(url);
		return await response.json();
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

	let triggerRef = $state<HTMLButtonElement>(null!);
	let open = $state(false);
	let statusValue = $state('');
	let selectedValue = $derived(requestDbStatusCombobox.find((f) => f.value === statusValue)?.label);

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
				submissionDate: v.created_at,
				reason: v.reason
			};
		})
	);

	const columns: ColumnDef<TableDataType>[] = [
		{
			id: 'expander',
			size: 50
		},
		{
			accessorKey: 'requestId',
			accessorFn: (row) => row.id
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
			id: 'reason',
			header: 'Rejection Reason',
			accessorFn: (row) => row.reason,
			cell: ({ row }) => {
				return row.original.reason;
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
	<DataTableSubRowTracking
		data={dataTableData}
		{columns}
		className="bg-white p-5 mr-10 rounded-md mb-5"
		headerClass="bg-uphButton text-white"
		fetchHandler={fetchPreloadData}
	></DataTableSubRowTracking>
</div>

<style>
	.wrapper-1::-webkit-scrollbar {
		display: none;
	}
</style>
