<script lang="ts" generics="TData, TValue">
	import { Button } from '$lib/components/ui/button/index.js';
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import {
		type ColumnDef,
		type ExpandedState,
		getCoreRowModel,
		getExpandedRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		type PaginationState,
		type VisibilityState
	} from '@tanstack/table-core';
	import { SquareChevronDown, SquareChevronUp } from 'lucide-svelte';
	import { tick } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import type { UserRequestHistoryType } from '../../../../routes/(app)/user/request/[id]/user-request-schema';
	import { Input } from '../input';

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
		className?: string;
		headerClass?: string;
		size?: string;
		fetchHandler: (id: number) => Promise<UserRequestHistoryType>;
		filterHandler?: (pageSize: number) => void;
	};

	// pagination
	const isDesktop = new MediaQuery('(min-width: 768px)');

	let { data, columns, className, headerClass, fetchHandler }: DataTableProps<TData, TValue> =
		$props();
	let expanded = $state<ExpandedState>({});
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 5 });
	let globalFilter = $state('');

	let historyData: UserRequestHistoryType | undefined = $state(undefined);
	let columnVisibility = $state<VisibilityState>({});

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
			},
			get columnVisibility() {
				return columnVisibility;
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
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				columnVisibility = updater(columnVisibility);
			} else {
				columnVisibility = updater;
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

	table.getColumn("requestId")?.toggleVisibility(false);
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
							<Table.Cell
								>
								{#if idx == 0}
									<button
										onclick={async () => {
											const response: UserRequestHistoryType = await fetchHandler(
												Number(row.getValue('requestId'))
											);
											const handler = row.getToggleExpandedHandler();
											handler();

											if (row.getIsExpanded()) {
												await tick();
												historyData = response;
											}
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
							<div class="w-full rounded-lg border-y-2 border-gray-200 bg-white p-8 shadow-sm">
								{#if historyData == undefined}
									<span>Loading</span>
								{:else}
									{#await fetchHandler(row.getValue('requestId'))}
										<span>Loading</span>
									{:then data}
										{#if data.userRequestHistory.length > 0}
											<div class="flex w-full flex-col items-start justify-start gap-10">
												<div
													class="flex w-full flex-col items-start justify-start rounded-xl border border-gray-200 px-8 py-9"
												>
													<div
														class="flex w-full flex-col items-start justify-center gap-8 sm:items-center"
													>
														<div class="relative flex w-full items-center justify-between">
															<!-- Progress Line Background -->
															<div
																class="absolute left-28 right-10 top-4 z-0 h-0.5 bg-gray-200"
															></div>
															<!-- Progress Line Active -->
															<!-- Change the right value to be able to track the progress -->
															<div
																class={`absolute left-28 right-10 ${['REJECTED', 'COMPLETED'].includes(data.userRequestHistory[data.userRequestHistory.length - 1].status) ? 'w-4xl' : data.userRequestHistory[data.userRequestHistory.length - 1].status == 'ONGOING' ? 'w-0' : data.userRequestHistory[data.userRequestHistory.length - 1].status == 'PROCESSING' ? 'w-2/4' : ''} top-4 z-0 h-0.5 bg-blue-600`}
															></div>

															<div class="relative z-10 flex flex-col items-center text-center">
																<div
																	class="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-uphButton text-sm font-bold text-white"
																>
																	1
																</div>
																<div class="mb-1 text-sm font-semibold text-uphButton">
																	Approved by Head of Study Program
																</div>
																<div class="text-xs text-gray-500">
																	{data.userRequestHistory[0]
																		? new Date(
																				data.userRequestHistory[0]?.created_at
																			).toLocaleDateString('id-ID', {
																				day: '2-digit',
																				month: 'short',
																				year: 'numeric'
																			})
																		: 'Pending'}
																</div>
															</div>

															<div class="relative z-10 flex flex-col items-center text-center">
																<div
																	class="mb-2 ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-uphButton text-sm font-bold text-white"
																>
																	2
																</div>
																<div class="mb-1 text-sm font-semibold text-uphButton">
																	Process By Admin
																</div>
																<div class="text-xs text-gray-500">
																	{data.userRequestHistory[1]
																		? new Date(
																				data.userRequestHistory[1]?.created_at
																			).toLocaleDateString('id-ID', {
																				day: '2-digit',
																				month: 'short',
																				year: 'numeric'
																			})
																		: 'Pending'}
																</div>
															</div>

															<div class="relative z-10 flex flex-col items-center text-center">
																<div
																	class="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-uphButton text-sm font-bold text-white"
																>
																	3
																</div>
																<div class="mb-1 text-sm font-semibold text-uphButton">
																	Finished
																</div>
																<div class="text-xs text-gray-500">
																	{data.userRequestHistory[2]
																		? new Date(
																				data.userRequestHistory[2]?.created_at
																			).toLocaleDateString('id-ID', {
																				day: '2-digit',
																				month: 'long',
																				year: 'numeric'
																			})
																		: 'Pending'}
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
										{:else}
											<div class="flex items-center justify-center">
												<span>Request is waiting for Approval</span>
											</div>
										{/if}
									{/await}
								{/if}
							</div>
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
