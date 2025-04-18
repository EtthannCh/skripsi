<script lang="ts">
	import { goto } from '$app/navigation';
	import { createSvelteTable, FlexRender, renderComponent } from '$lib/components/ui/data-table';
	import * as Table from '$lib/components/ui/table/index.js';
	import exportExcel from '$lib/excelExport';
	import { type ColumnDef, type TableOptions } from '@tanstack/svelte-table';
	import { getCoreRowModel } from '@tanstack/table-core';
	import { ArrowLeft } from 'lucide-svelte';
	import { Stretch } from 'svelte-loading-spinners';
	import {
		requestDbStatusEnum,
		requestEnumColor,
		type ExcelTableSchema
	} from '../request-user-schema';
	import type { PageData } from './$types';
	import DataTableLink from '$lib/components/ui/data-table/data-table-link.svelte';
	import { page } from '$app/state';
	import DataTableBadgeCell from '$lib/components/ui/data-table/data-table-badge-cell.svelte';

	let { data }: { data: PageData } = $props();

	const defaultColumnsExcel: ColumnDef<ExcelTableSchema>[] = [
		{
			accessorKey: 'request_id',
			accessorFn: (row) => row.request_id,
			cell: ({ row }) => row.original.request_id,
			header: 'Request Id'
		},
		{
			accessorKey: 'request_code',
			accessorFn: (row) => row.request_code,
			cell: ({ row }) => row.original.request_code,
			header: 'Request Number'
		},
		{
			accessorKey: 'status',
			accessorFn: (row) => row.status,
			cell: ({ row }) => {
				return renderComponent(DataTableBadgeCell, {
					value: requestDbStatusEnum[row.original.status],
					className: requestEnumColor[row.original.status]
				});
			},
			header: 'Application Status'
		},
		{
			accessorKey: 'nim',
			accessorFn: (row) => row.nim,
			cell: ({ row }) => row.original.nim,
			header: "Applicant's Student Number"
		},
		{
			accessorKey: 'username',
			accessorFn: (row) => row.username,
			cell: ({ row }) => row.original.username,
			header: "Applicant's Name"
		},
		{
			accessorKey: 'email',
			accessorFn: (row) => row.email,
			cell: ({ row }) => row.original.email,
			header: "Applicant's Email"
		},
		{
			accessorKey: 'form_code',
			accessorFn: (row) => row.form_code,
			header: 'Form Code',
			cell: ({ row }) => row.original.form_code.replace('_', '-')
		},
		{
			accessorKey: 'form_name',
			accessorFn: (row) => row.form_name,
			header: 'Form Code',
			cell: ({ row }) => row.original.form_name
		},
		{
			accessorKey: 'pending',
			accessorFn: (row) => row.pending,
			cell: ({ row }) =>
				new Date(row.original.pending).toLocaleDateString('id-ID', {
					day: '2-digit',
					month: 'long',
					year: '2-digit'
				}) +
				' ' +
				new Date(row.original.pending).toLocaleTimeString(),
			header: 'Pending',
			size: 200
		},
		{
			accessorKey: 'ongoing',
			accessorFn: (row) => row.ongoing,
			cell: ({ row }) => {
				if (row.original.ongoing != 'NONE') {
					return (
						new Date(row.original.ongoing).toLocaleDateString('id-ID', {
							day: '2-digit',
							month: 'long',
							year: '2-digit'
						}) +
						' ' +
						new Date(row.original.ongoing).toLocaleTimeString()
					);
				} else {
					return row.original.ongoing;
				}
			},
			header: 'Ongoing',
			size: 200
		},
		{
			accessorKey: 'processing',
			accessorFn: (row) => row.processing,
			cell: ({ row }) => {
				if (row.original.processing != 'NONE') {
					return (
						new Date(row.original.processing).toLocaleDateString('id-ID', {
							day: '2-digit',
							month: 'long',
							year: '2-digit'
						}) +
						' ' +
						new Date(row.original.processing).toLocaleTimeString()
					);
				} else {
					return row.original.processing;
				}
			},
			header: 'Processing',
			size: 200
		},
		{
			accessorKey: 'completed',
			accessorFn: (row) => row.completed,
			cell: ({ row }) => {
				if (row.original.completed != 'NONE') {
					return (
						new Date(row.original.completed).toLocaleDateString('id-ID', {
							day: '2-digit',
							month: 'long',
							year: '2-digit'
						}) +
						' ' +
						new Date(row.original.completed).toLocaleTimeString()
					);
				} else {
					return row.original.completed;
				}
			},
			header: 'Completed',
			size: 200
		},
		{
			accessorKey: 'uploaded_file_url',
			accessorFn: (row) => row.uploaded_file_url,
			cell: ({ row }) => {
				if (row.original.uploaded_file_url != 'NONE') {
					return renderComponent(DataTableLink, {
						label: "Student's PDF Link",
						url: row.original.uploaded_file_url,
						blank: true
					});
				} else {
					return row.original.uploaded_file_url;
				}
			},
			header: 'Uploaded File URL'
		},
		{
			accessorKey: 'completion_file_url',
			accessorFn: (row) => row.completion_file_url,
			cell: ({ row }) => {
				if (row.original.completion_file_url != 'NONE') {
					return renderComponent(DataTableLink, {
						label: 'PDF Link',
						url: row.original.completion_file_url,
						blank: true
					});
				} else {
					return row.original.completion_file_url;
				}
			},
			header: 'Completion File URL'
		},
		{
			accessorKey: 'reason',
			accessorFn: (row) => row.reason,
			cell: ({ row }) => row.original.reason,
			header: 'Reason'
		}
	];

	const optionsExcelTable: TableOptions<ExcelTableSchema> = {
		data: data.exportTableData ?? [],
		columns: defaultColumnsExcel,
		getCoreRowModel: getCoreRowModel()
	};
	const excelTable = createSvelteTable(optionsExcelTable);
	const exportToExcel = () => {
		exportExcel(excelTable, 'apa');
	};
	let loading: boolean = $state(false);

	let isMobile = $state(false);
	let windowWidth = $state(0);
	$effect(() => {
		if (windowWidth > 1010) {
			isMobile = false;
		} else {
			isMobile = true;
		}
	});
</script>

<svelte:window bind:innerWidth={windowWidth} />
<div
	class={`mx-auto mb-10 flex flex-col bg-white ${isMobile ? 'w-[400px]' : ' w-[1350px]'} rounded-md py-3`}
>
	<div class="my-5 flex flex-col items-center justify-center gap-5">
		<div class="flex flex-row gap-5">
			<span class="rounded-md bg-uph p-5 text-white"
				>From (YYYY/MM/DD) : ({page.url.searchParams.get('startDate')}) to  ({page.url.searchParams.get(
					'endDate'
				)})</span
			>
			<span class="rounded-md bg-uph p-5 text-white"
				>Filter : {page.url.searchParams.get('filter')}</span
			>
		</div>
		<div class="flex flex-row gap-5">
			{#if page.url.searchParams.get('status')}
				<span class="rounded-md bg-uph p-5 text-white">{page.url.searchParams.get('status')}</span>
			{:else}
				<span class="rounded-md bg-uph p-5 text-white">No Status Selected</span>
			{/if}
			<span class="rounded-md bg-uph p-5 text-white"
				>{data.formList.find((v) => v.id == Number(page.url.searchParams.get('form') ?? 0))?.name} ({data.formList.find(
					(v) => v.id == Number(page.url.searchParams.get('form') ?? 0)
				)?.code.replace("_", "-")})</span
			>
		</div>
		<div class="flex flex-row items-center justify-center">
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
			{#if data.exportTableData != undefined && data.exportTableData.length > 0}
				<button
					class="flex h-10 items-center rounded-md bg-uphButton p-3 text-white"
					onclick={exportToExcel}>Export to Excel</button
				>
			{/if}
		</div>
		{#if loading}
			<div class="mx-10 mb-4 flex h-10 flex-col gap-3">
				<span>Loading</span>
				<Stretch color="#314986" />
			</div>
		{/if}
	</div>

	{#if data.exportTableData != undefined}
		<div class="overflow-x-auto px-5">
			<div
				class="border-gray-500s m-3 mx-auto max-h-[600px] w-[1200px] overflow-y-scroll rounded-md border-2"
			>
				<Table.Root>
					<Table.Header class="bg-uph">
						{#each excelTable.getHeaderGroups() as headerGroup}
							<Table.Row>
								{#each headerGroup.headers as header}
									<Table.Head
										class="border-x-[1px] border-y-[1px] border-black p-5 text-white"
										style="width: {header.column.getSize()}px"
									>
										{#if !header.isPlaceholder}
											<FlexRender
												content={header.column.columnDef.header}
												context={header.getContext()}
											/>
										{/if}
									</Table.Head>
								{/each}
							</Table.Row>
						{/each}
					</Table.Header>
					<Table.Body>
						{#each excelTable.getRowModel().rows as row}
							<Table.Row data-state={row.getIsSelected() && 'selected'}>
								{#each row.getVisibleCells() as cell (cell.id)}
									<Table.Cell class="border-x-[1px] border-y-[1px] border-black">
										<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
									</Table.Cell>
								{/each}
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		</div>
	{:else}
		<div class="flex flex-col items-center justify-center">
			<span>No Data Found</span>
		</div>
	{/if}
</div>
