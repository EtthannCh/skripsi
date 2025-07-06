<script lang="ts" generics="TData, TValue">
	import { type ColumnDef } from '@tanstack/svelte-table';
	type DataTableProps<TData, TValue> = {
		data: TData[];
		columns: ColumnDef<TData, TValue>[];
		size?: string;
	};
	let { data, columns, size }: DataTableProps<TData, TValue> = $props();
</script>

<div class="w-full rounded-lg border-y-2 border-gray-200 bg-white p-8 shadow-sm">
	<div class="flex w-full flex-col items-start justify-start gap-10">
		<div
			class="flex w-full flex-col items-start justify-start rounded-xl border border-gray-200 px-8 py-9"
		>
			<div class="flex w-full flex-col items-start justify-center gap-8 sm:items-center">
				<div class="relative flex w-full items-center justify-between">
					<!-- Progress Line Background -->
					<div class="absolute left-10 right-10 top-4 z-0 h-0.5 bg-gray-200"></div>
					<!-- Progress Line Active -->
					<div class="absolute left-10 right-10 top-4 z-0 h-0.5 bg-indigo-600"></div>

					<!-- Step 1: Order Placed -->
					<div class="relative z-10 flex flex-col items-center text-center">
						<div
							class="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white"
						>
							1
						</div>
						<div class="mb-1 text-sm font-semibold text-indigo-600">Order Placed</div>
						<div class="text-xs text-gray-500">Feb 20th, 2024</div>
					</div>

					<!-- Step 2: Order Packed -->
					<div class="relative z-10 flex flex-col items-center text-center">
						<div
							class="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white"
						>
							2
						</div>
						<div class="mb-1 text-sm font-semibold text-indigo-600">Order Packed</div>
						<div class="text-xs text-gray-500">Feb 20th, 2024</div>
					</div>

					<!-- Step 3: In Transit -->
					<div class="relative z-10 flex flex-col items-center text-center">
						<div
							class="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white"
						>
							3
						</div>
						<div class="mb-1 text-sm font-semibold text-indigo-600">In Transit</div>
						<div class="text-xs text-gray-500">Feb 20th, 2024</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
