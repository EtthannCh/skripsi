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
	import { MediaQuery } from 'svelte/reactivity';
	import Button from '../button/button.svelte';
	import { Input } from '../input';
	import DataTableSubRowTracking from './data-table-sub-row-tracking.svelte';

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
		className?: string;
		headerClass?: string;
		size?: string;
		historyData?: TData[];
		fetchHandler?: (id: number) => void;
		filterHandler?: (pageSize: number) => void;
	};

	// pagination
	const isDesktop = new MediaQuery('(min-width: 768px)');
	const perPage = $derived(isDesktop.current ? 5 : 5);
	const siblingCount = $derived(isDesktop.current ? 1 : 0);
	let pagesFilter: number = $state(0);

	let {
		data,
		columns,
		className,
		headerClass,
		size,
		historyData,
		fetchHandler,
		filterHandler
	}: DataTableProps<TData, TValue> = $props();
	let expanded = $state<ExpandedState>({});
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 5 });
	let globalFilter = $state('');
	let selectedRowId = $state(0);
	

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
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<div class="flex items-center justify-end space-x-2 py-4">
		<!-- <div
			class="sticky bottom-0 mx-auto my-5 flex w-[400px] items-center justify-center rounded-full bg-white py-2"
		>
			<Pagination.Root count={historyData.length ?? 0} {perPage} {siblingCount}>
				{#snippet children({ pages })}
					<Pagination.Content>
						<Pagination.Item>
							<Pagination.PrevButton
								onclick={() => {
									pagesFilter -= 1;
									filterHandler(pagesFilter);
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
											filterHandler(pagesFilter);
										}}
									>
										{page.value}
									</Pagination.Link>
								</Pagination.Item>
							{/if}
						{/each}
						<Pagination.Item>
							<Pagination.NextButton
								disabled={historyData.length == 0}
								onclick={() => {
									pagesFilter += 1;
									filterHandler(pagesFilter);
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
