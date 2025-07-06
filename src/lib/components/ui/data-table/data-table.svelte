<script lang="ts" generics="TData, TValue">
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import {
		type ColumnDef,
		type ExpandedState,
		getCoreRowModel,
		getExpandedRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		type PaginationState
	} from '@tanstack/table-core';
	import { SquareChevronDown, SquareChevronUp } from 'lucide-svelte';
	import Button from '../button/button.svelte';
	import { Input } from '../input';
	import DataTableSubRowTracking from './data-table-sub-row-tracking.svelte';

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
		className?: string;
		headerClass?: string;
		size?: string;
	};

	let { data, columns, className, headerClass, size }: DataTableProps<TData, TValue> =
		$props();
	let expanded = $state<ExpandedState>({});
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 5 });
	let globalFilter = $state('');

	const table = createSvelteTable({
		get data() {
			return data;
		},
		columns,
		getRowCanExpand: (row) => true,
		state: {
			get pagination() {
				return pagination;
			},
			get globalFilter() {
				return globalFilter;
			},
			get expanded() {
				return expanded;
			}
		},
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		onExpandedChange: (updater) => {
			if (typeof updater === 'function') {
				expanded = updater(expanded);
			} else {
				expanded = updater;
			}
		},

		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		onGlobalFilterChange: (updater) => {
			globalFilter = typeof updater === 'function' ? updater(globalFilter) : updater;
		}
	});
</script>

<div class={className}>
	<div class="flex items-center py-4">
		<Input
			placeholder="Filter Form..."
			value={globalFilter ?? ''}
			oninput={(e) => {
				globalFilter = e.currentTarget?.value.trim();
			}}
			class="max-w-sm"
		/>
	</div>
	<div class="rounded-md border">
		<Table.Root>
			<Table.Header class="rounded-lg">
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
						{#each headerGroup.headers as header (header.id)}
							<Table.Head class={`${headerClass}`} style="width: {header.column.getSize()}px">
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
				{#each table.getRowModel().rows as row (row.id)}
					<Table.Row data-state={row.getIsSelected() && 'selected'} class="text-[18px]">
						{#each row.getVisibleCells() as cell, idx (cell.id)}
							<Table.Cell>
								{#if idx == 0}
									<button
										onclick={() => {
											const handler = row.getToggleExpandedHandler();
											handler();
										}}
									>
										{#if row.getIsExpanded()}
											<SquareChevronUp color="black" />
										{:else}
											<SquareChevronDown color="black" />
										{/if}
									</button>
								{/if}
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
					{#if row.getIsExpanded()}
						<Table.Cell colspan={table.getAllLeafColumns().length}>
							<DataTableSubRowTracking data={[]} {columns}></DataTableSubRowTracking>
						</Table.Cell>
					{/if}
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<div class="flex items-center justify-end space-x-2 py-4">
		<Button
			variant="outline"
			size="sm"
			onclick={() => table.previousPage()}
			disabled={!table.getCanPreviousPage()}
		>
			Previous
		</Button>
		<Button
			variant="outline"
			size="sm"
			onclick={() => table.nextPage()}
			disabled={!table.getCanNextPage()}
		>
			Next
		</Button>
	</div>
</div>
