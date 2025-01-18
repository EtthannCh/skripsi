<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { navigating } from '$app/state';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { createSvelteTable, FlexRender, renderComponent } from '$lib/components/ui/data-table';
	import DataTableLink from '$lib/components/ui/data-table/data-table-link.svelte';
	import DataTableMultipleRowCell from '$lib/components/ui/data-table/data-table-multiple-row-cell.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { RangeCalendar } from '$lib/components/ui/range-calendar/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { cn } from '$lib/utils.js';
	import {
		CalendarDate,
		DateFormatter,
		getLocalTimeZone,
		type DateValue
	} from '@internationalized/date';
	import { type ColumnDef, type TableOptions } from '@tanstack/svelte-table';
	import { getCoreRowModel } from '@tanstack/table-core';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import { Stretch } from 'svelte-loading-spinners';
	import { toast } from 'svelte-sonner';
	import { fileProxy, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import type { PageData } from './$types';
	import {
		requestDbStatusCombobox,
		userRequestSchema,
		type RequestDbSchema,
		type UserCookiesSchema
	} from './user-schema';

	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});
	const currentDate = new Date();

	let calenderValue = $state({
		start: new CalendarDate(currentDate.getFullYear(), currentDate.getMonth(), 1),
		end: new CalendarDate(currentDate.getFullYear(), currentDate.getMonth(), 1).add({ days: 20 })
	});
	let startValue: DateValue | undefined = $state(undefined);

	let { data }: { data: PageData } = $props();

	const user: UserCookiesSchema = data.user;

	let submitPressed = $state(false);
	let open = $state(false);
	let statusValue = $state('');
	let triggerRef = $state<HTMLButtonElement>(null!);

	let selectedValue = $derived(requestDbStatusCombobox.find((f) => f.value === statusValue)?.label);

	const form = superForm(data.form, {
		validators: zodClient(userRequestSchema),
		onResult: ({ result }) => {
			if (result.type == 'success') {
				toast.success('Successfully Saved', {
					position: 'top-right',
					dismissable: true
				});
				goto('/home');
				invalidateAll();
			} else {
				toast.info('Invalid Form / File size too big', {
					position: 'top-right',
					dismissable: true
				});
			}
		},
		dataType: 'json'
	});

	const formSelection = data.formSelection.map((v) => {
		return {
			label: v.code,
			value: v.id.toString()
		};
	});

	const defaultColumns: ColumnDef<RequestDbSchema>[] = [
		{
			accessorKey: 'status',
			accessorFn: (row) => row.status,
			header: 'Application Status',
			size: 100,
			cell: ({ row }) => {
				return row.original.status.split('_').join(' ');
			}
		},
		{
			accessorKey: 'user_name',
			accessorFn: (row) => row.created_by,
			header: "Applicant's Name",
			size: 200,
			cell: ({ row }) => {
				return renderComponent(DataTableMultipleRowCell, {
					value: `Name : ${row.original.created_by}`,
					value2: `NIM : ${row.original.user_credentials.email.split('@')[0]}`
				});
			}
		},
		{
			accessorKey: 'form_code',
			accessorFn: (row) => row.form_db.code,
			header: 'Form Details',
			cell: ({ row }) => {
				return renderComponent(DataTableMultipleRowCell, {
					value: `Name : ${row.original.form_db.name}`,
					value2: `Code : ${row.original.form_db.code}`
				});
			},
			size: 200
		},
		{
			accessorKey: 'created_at',
			accessorFn: (row) => row.created_at,
			header: 'Date of Request',
			cell: ({ row }) => {
				return renderComponent(DataTableMultipleRowCell, {
					value: new Date(row.original.created_at).toLocaleDateString('id-ID', {
						day: '2-digit',
						month: 'short',
						year: 'numeric'
					}),
					value1: new Date(row.original.created_at).toLocaleTimeString()
				});
			},
			size: 200
		},
		{
			accessorKey: 'form_url',
			accessorFn: (row) => row.form_url ?? '',
			header: 'Application File',
			cell: ({ row }) => {
				return renderComponent(DataTableLink, {
					url: row.original.form_url,
					label: 'Link PDF',
					blank: true
				});
			}
		},
		{
			accessorKey: 'action',
			header: '',
			cell: ({ row }) => {
				return renderComponent(DataTableLink, {
					url: `/user/${row.original.user_credentials.user_pkey}/detail/${row.original.id}`,
					label: 'Detail'
				});
				// if (
				// 	row.original.status == 'REJECTED' ||
				// 	row.original.status == 'APPROVED' ||
				// 	(row.original.status == 'AWAITING_APPROVAL' && user.roleId != 2) ||
				// 	(row.original.status == 'PENDING' && user.roleId != 1)
				// ) {
				// 	return;
				// } else {
				// 	return renderComponent(DataTableActions, {
				// 		id: row.original.id.toString(),
				// 		approveFunc: async () => handleActions(user.roleId.toString(), row.original.id),
				// 		rejectFunc: async () => handleActions('REJECTED', row.original.id)
				// 	});
				// }
			}
		}
	];

	const options: TableOptions<RequestDbSchema> = {
		get data() {
			return data.requestDbData;
		},
		columns: defaultColumns,
		getCoreRowModel: getCoreRowModel(),
		enableColumnResizing: true
	};

	const table = createSvelteTable(options);

	let openDialog = $state(false);

	const { form: formData, enhance, errors } = form;
	const file = fileProxy(form, 'formFile');

	const handleActions = async (param: string, id: number) => {
		let tempParam = '';
		if (param == '1') {
			tempParam = 'AWAITING_APPROVAL';
		} else if (param == '2') {
			tempParam = 'APPROVED';
		} else {
			tempParam = param;
		}
		const response = await fetch('/home', {
			method: 'post',
			body: JSON.stringify({
				status: tempParam,
				id
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

	let filter: string = $state('');

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}

	const filterHandler = async () => {
		await goto(
			`/home?filter=${filter}&status=${statusValue}&startDate=${new Date(calenderValue.start.toString()).toISOString().split('T')[0]}&endDate=${new Date(calenderValue.end.toString()).toISOString().split('T')[0]}`,
			{
				invalidateAll: true,
				replaceState: true
			}
		);
	};
</script>

{#if user.roleId == 3 && user.roleId}
	<Accordion.Root
		type="single"
		class="mx-auto my-auto flex w-[700px] flex-col justify-center sm:max-w-[30%] md:max-w-[50%] lg:max-w-[100%]"
	>
		<Accordion.Item value="item-1">
			<Accordion.Trigger>Pengambilan Form</Accordion.Trigger>
			<Accordion.Content>
				{#each data.formSelection as form}
					<Card.Root class="my-5 flex w-full items-center justify-between">
						<Card.Header class="px-5 py-0">
							<Card.Title>{form.name}</Card.Title>
							<Card.Description>{form.description ?? 'Tidak Ada Penjelasan'}</Card.Description>
						</Card.Header>
						<Card.Content class="grid gap-4">
							<div class="flex flex-col items-center justify-center gap-0.5 text-right">
								<Label>{form.code}</Label>
								<span
									><a
										href={`/api/pdf/${form.id}`}
										download={form.name}
										class="group relative text-[#18272F] no-underline"
									>
										Download PDF
										<span
											class="absolute bottom-0 left-0 h-[2px] w-full origin-right scale-x-0 rounded-sm bg-[#18272F] transition-transform group-hover:origin-left group-hover:scale-x-100"
										></span>
									</a></span
								>
							</div>
						</Card.Content>
					</Card.Root>
				{/each}
			</Accordion.Content>
		</Accordion.Item>
		<Accordion.Item value="item-2">
			<Accordion.Trigger>Pengajuan Form</Accordion.Trigger>
			<Accordion.Content>
				<form action="?/submit" enctype="multipart/form-data" method="post" use:enhance>
					<Form.Field {form} name="userId">
						<Form.Control let:attrs>
							<Input bind:value={user.userId} type="hidden" />
						</Form.Control>
					</Form.Field>
					<div class="flex flex-col gap-5">
						<div>
							<Label>User Name</Label>
							<Input value={user.username} disabled />
						</div>
						<div>
							<Label>User Email</Label>
							<Input value={user.email} disabled />
						</div>
					</div>
					<Form.Field {form} name="formId">
						<Form.Control let:attrs>
							<div class="my-5 flex w-full flex-col gap-5">
								<Form.Label>Jenis Form</Form.Label>
								<Select.Root type="single" name="formId" bind:value={$formData.formId}>
									<Select.Trigger>
										{formSelection.find((v) => v.value == $formData.formId)?.label ?? 'Pilih Form'}
									</Select.Trigger>
									<Select.Content>
										<Select.Group>
											{#each formSelection as form}
												<Select.Item value={form.value} label={form.label}>{form.label}</Select.Item
												>
											{/each}
										</Select.Group>
									</Select.Content>
									{#if $formData.formId == '' && submitPressed}
										<span class="text-red-700">Belum Memilih Jenis Form</span>
									{/if}
								</Select.Root>
							</div>
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="formFile">
						<Form.Control let:attrs>
							<div class="flex flex-col gap-5">
								<Form.Label>{`Upload Form Permohonan (Max Size Allowed :  5mb)`}</Form.Label>
								<input accept="application/pdf" type="file" bind:files={$file} />
							</div>
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Button
						class="my-5 bg-black text-white"
						type="submit"
						onclick={() => {
							submitPressed = true;
						}}>Submit</Form.Button
					>
				</form>
			</Accordion.Content>
		</Accordion.Item>
	</Accordion.Root>
{:else}
	<div>
		<div class="mx-[175px] flex flex-row items-center">
			<div class="my-5 flex flex-row items-center gap-5">
				<Input class="w-[100px] border-2 border-black" bind:value={filter} placeholder="Search" />
			</div>
			<div class="mx-5 flex flex-row items-center gap-5">
				<Popover.Root bind:open>
					<Popover.Trigger bind:ref={triggerRef}>
						{#snippet child({ props })}
							<Button
								variant="outline"
								class="w-[200px] justify-between"
								{...props}
								role="combobox"
								aria-expanded={open}
							>
								{selectedValue || 'Pilih Status'}
								<ChevronsUpDown class="opacity-50" />
							</Button>
						{/snippet}
					</Popover.Trigger>
					<Popover.Content class="w-[200px] p-0">
						<Command.Root>
							<Command.Input placeholder="Cari Status..." />
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
				<div class="grid gap-2">
					<Popover.Root>
						<Popover.Trigger
							class={cn(
								buttonVariants({ variant: 'outline' }),
								!calenderValue && 'text-muted-foreground'
							)}
						>
							<CalendarIcon class="mr-2 size-4" />
							{#if calenderValue && calenderValue.start}
								{#if calenderValue.end}
									{df.format(calenderValue.start.toDate(getLocalTimeZone()))} - {df.format(
										calenderValue.end.toDate(getLocalTimeZone())
									)}
								{:else}
									{df.format(calenderValue.start.toDate(getLocalTimeZone()))}
								{/if}
							{:else if startValue}
								{df.format(startValue.toDate(getLocalTimeZone()))}
							{:else}
								Pick a date
							{/if}
						</Popover.Trigger>
						<Popover.Content class="w-auto p-0" align="start">
							<RangeCalendar
								bind:value={calenderValue}
								onStartValueChange={(v) => {
									startValue = v;
								}}
								numberOfMonths={3}
							/>
						</Popover.Content>
					</Popover.Root>
				</div>
			</div>
			<div class="flex flex-row items-center gap-5">
				<button
					onclick={filterHandler}
					class="flex h-10 items-center rounded-md bg-black p-3 text-white transition-all ease-in-out hover:bg-blue-600 hover:text-white"
					>Filter</button
				>
				<button
					class="flex h-10 items-center rounded-md bg-black p-3 text-white transition-all ease-in-out hover:bg-blue-600 hover:text-white"
					onclick={() => {
						filter = '';
						statusValue = '';
						calenderValue = {
							start: new CalendarDate(currentDate.getFullYear(), currentDate.getMonth(), 1),
							end: new CalendarDate(currentDate.getFullYear(), currentDate.getMonth(), 1).add({
								days: 20
							})
						};
						filterHandler();
					}}
					>Reset
				</button>
				{#if navigating.to}
					<div class="mb-4 h-10">
						<Stretch color="#314986" />
					</div>
				{/if}
			</div>
		</div>
		<div
			class="border-gray-500s m-3 mx-auto max-h-[500px] w-[1000px] overflow-y-scroll rounded-md border-2"
		>
			<Table.Root>
				<Table.Header class="bg-uph">
					{#each table.getHeaderGroups() as headerGroup}
						<Table.Row>
							{#each headerGroup.headers as header}
								<Table.Head
									class="border-l-[1px] p-5 text-white first:border-none"
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
					{#each table.getRowModel().rows as row}
						<Table.Row data-state={row.getIsSelected() && 'selected'}>
							{#each row.getVisibleCells() as cell (cell.id)}
								<Table.Cell class="border-l-[1px] first:border-none">
									<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
								</Table.Cell>
							{/each}
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	</div>
{/if}

<Dialog.Root bind:open={openDialog}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Confirmation Dialog</Dialog.Title>
			<Dialog.Description>Are you sure</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button type="submit">Save changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
