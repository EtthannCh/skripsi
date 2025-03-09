<script lang="ts">
	import { goto } from '$app/navigation';
	import { navigating, page } from '$app/state';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { createSvelteTable, FlexRender, renderComponent } from '$lib/components/ui/data-table';
	import DataTableBadgeCell from '$lib/components/ui/data-table/data-table-badge-cell.svelte';
	import DataTableLink from '$lib/components/ui/data-table/data-table-link.svelte';
	import DataTableMultipleRowCell from '$lib/components/ui/data-table/data-table-multiple-row-cell.svelte';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
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
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import { Stretch, SyncLoader } from 'svelte-loading-spinners';
	import { toast } from 'svelte-sonner';
	import { MediaQuery } from 'svelte/reactivity';
	import { fileProxy, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import type { PageData } from './$types';
	import {
		requestDbStatusCombobox,
		requestDbStatusEnum,
		requestEnumColor,
		userRequestSchema,
		type RequestDbSchema,
		type UserCookiesSchema
	} from './request-user-schema';

	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});
	const currentDate = new Date();

	let calenderValue = $state({
		start: new CalendarDate(currentDate.getFullYear(), currentDate.getMonth(), 1),
		end: new CalendarDate(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
	});

	let startValue: DateValue | undefined = $state(undefined);

	let { data }: { data: PageData } = $props();

	const user: UserCookiesSchema = data.user;

	let submitPressed = $state(false);
	let open = $state(false);
	let openFormCombobox = $state(false);
	let statusValue = $state('');
	let formValue = $state('');
	let triggerRef = $state<HTMLButtonElement>(null!);

	const formDbCombobox = data.formSelection.flatMap((v) => {
		return {
			label: v.code,
			value: v.id.toString()
		};
	});

	let selectedValue = $derived(requestDbStatusCombobox.find((f) => f.value === statusValue)?.label);
	let selectedFormValue = $derived(formDbCombobox.find((f) => f.value === formValue)?.label);
	let formLoading = $state(false);

	const form = superForm(data.form, {
		validators: zodClient(userRequestSchema),
		onResult: ({ result }) => {
			formLoading = false;
			if (result.type == 'success') {
				toast.success(result.data?.form.message, {
					position: 'top-right',
					dismissable: true
				});
				return goto('/home', { invalidateAll: true });
			} else if (result.type == 'failure') {
				toast.error(result.data?.message, {
					position: 'top-right',
					dismissable: true
				});
			}
		},
		onSubmit: ({}) => {
			formLoading = true;
		},
		dataType: 'json'
	});

	function toTitleCase(str: string) {
		return str.replace(
			/\w\S*/g,
			(text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
		);
	}

	const formSelection = data.formSelection.map((v) => {
		return {
			label: v.code,
			value: v.id.toString()
		};
	});

	const defaultColumns: ColumnDef<RequestDbSchema>[] = [
		{
			accessorKey: 'request_code',
			accessorFn: (row) => row.request_code,
			header: 'Request Number',
			size: 150
		},
		{
			accessorKey: 'status',
			accessorFn: (row) => row.status,
			header: 'Application Status',
			size: 100,
			cell: ({ row }) => {
				return renderComponent(DataTableBadgeCell, {
					value: requestDbStatusEnum[row.original.status],
					className: requestEnumColor[row.original.status]
				});
			}
		},
		{
			accessorKey: 'user_name',
			accessorFn: (row) => row.created_by,
			header: "Applicant's Name",
			size: 200,
			cell: ({ row }) => {
				return renderComponent(DataTableMultipleRowCell, {
					value: `Name : ${toTitleCase(row.original.created_by)}`,
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
					value2: `Code : ${row.original.form_db.code.replace('_', '-')}`
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

	const { form: formData, errors, enhance } = form;
	const file = fileProxy(form, 'formFile');

	let filter: string = $state('');

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}

	function closeAndFocusTriggerForFormDbx() {
		openFormCombobox = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}
	let pageFilter = $state(0);

	$effect.root(() => {
		let date = new Date();
		const searchParam = page.url.searchParams.get('filter') ?? '';
		const statusParam = page.url.searchParams.get('status') ?? '';
		const startDateParam =
			page.url.searchParams.get('startDate') ?? new Date(date.getFullYear(), date.getMonth(), 1);
		const endDateParam =
			page.url.searchParams.get('endDate') ?? new Date(date.getFullYear(), date.getMonth() + 1, 0);
		const formTypeParam = page.url.searchParams.get('form') ?? '';
		const pagesParam = page.url.searchParams.get('pages') ?? 0;

		const startDate = new Date(startDateParam);
		const endDate = new Date(endDateParam);

		filter = searchParam;
		statusValue = statusParam;
		calenderValue.start = new CalendarDate(
			startDate.getFullYear(),
			startDate.getMonth() + 1,
			startDate.getDate()
		);
		calenderValue.end = new CalendarDate(
			endDate.getFullYear(),
			endDate.getMonth() + 1,
			endDate.getDate() + 1
		);
		formValue = formTypeParam;
		pageFilter = Number(pagesParam);
	});

	const filterHandler = async () => {
		await goto(
			`/home?pages=${pageFilter}&filter=${filter}&status=${statusValue}&startDate=${new Date(calenderValue.start.toString()).toISOString().split('T')[0]}&endDate=${new Date(calenderValue.end.toString()).toISOString().split('T')[0]}&form=${formValue}`,
			{
				invalidateAll: true,
				replaceState: true
			}
		);
	};
	const isDesktop = new MediaQuery('(min-width: 414px)');
	const perPage = $derived(isDesktop.current ? 10 : 5);
	const siblingCount = $derived(isDesktop.current ? 1 : 0);
</script>

{#if user.roleId == 3 && user.roleId}
	<Accordion.Root
		type="single"
		class="mx-auto my-auto flex w-[700px] flex-col justify-center sm:max-w-[30%] md:max-w-[50%] lg:max-w-[100%] "
	>
		<Accordion.Item value="item-1">
			<Accordion.Trigger class="text-2xl">Pengambilan Form</Accordion.Trigger>
			<Accordion.Content class="scroll-none max-h-[550px] overflow-y-scroll">
				{#each data.formSelection as form}
					<Card.Root class="my-5 flex w-full items-center justify-between">
						<Card.Header class="px-5 py-0">
							<Card.Title>{form.name}</Card.Title>
							<Card.Description>{form.description ?? 'Tidak Ada Penjelasan'}</Card.Description>
						</Card.Header>
						<Card.Content class="grid gap-4">
							<div class="flex flex-col items-center justify-center gap-0.5 text-right">
								<Label>{form.code.replace('_', '-')}</Label>
								<span
									><a
										href={`${form.form_url}`}
										target="_blank"
										class="group relative text-[#18272F] no-underline"
									>
										View PDF
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
			<Accordion.Trigger class="text-2xl">Pengajuan Form</Accordion.Trigger>
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
										{formSelection
											.find((v) => v.value == $formData.formId)
											?.label.replace('_', '-') ?? 'Pilih Form'}
									</Select.Trigger>
									<Select.Content>
										<Select.Group>
											{#each formSelection as form}
												<Select.Item value={form.value} label={form.label}
													>{form.label.replace('_', '-')} ({data.formSelection.find(
														(v) => v.id == Number(form.value)
													)?.name})</Select.Item
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
								<span class="text-sm"
									>(Penamaan File :
									KodeForm-NIMPemohon-KodeJurusan(INF/IS/MGT/HOS/MGT/LAW)-EmailPemohon.pdf)</span
								>
								<span class="text-red-600"
									>({'NOTE : Kode Form pada penamaan file yang diupload jika tidak sama dengan yang dipilih, tidak dapat dilanjutkan'
										.toString()
										.toUpperCase()})</span
								>
								<input accept="application/pdf" type="file" bind:files={$file} />
							</div>
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					{#if formLoading}
						<span>
							<SyncLoader color="#007bff" />
						</span>
					{:else}
						<button
							class="my-5 rounded-md bg-uphButton p-2 text-white"
							onclick={() => {
								submitPressed = true;
							}}
						>
							Submit</button
						>
					{/if}
				</form>
			</Accordion.Content>
		</Accordion.Item>
	</Accordion.Root>
{:else}
	<div>
		<div class="flex items-center justify-center">
			<h1>Hi, {toTitleCase(user.username)}</h1>
		</div>
		<div class="mx-[175px] flex items-center justify-center sm:flex-col md:flex-col lg:flex-row">
			<div class="my-5 flex flex-row items-center gap-5">
				<Input class="w-[100px] border-2 border-black" bind:value={filter} placeholder="Search" />
			</div>
			<div
				class="mx-5 flex items-center gap-5 max-md:flex-col max-sm:flex-col sm:flex-col md:flex-col lg:flex-row"
			>
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
				<Popover.Root bind:open={openFormCombobox}>
					<Popover.Trigger bind:ref={triggerRef}>
						{#snippet child({ props })}
							<Button
								variant="outline"
								class="justify-between max-md:w-full max-sm:w-full sm:w-full md:w-full lg:w-[200px]"
								{...props}
								role="combobox"
								aria-expanded={open}
							>
								{selectedFormValue?.replace('_', '-') || 'Choose Form Type'}
								<ChevronsUpDown class="opacity-50" />
							</Button>
						{/snippet}
					</Popover.Trigger>
					<Popover.Content class="w-[200px] p-0">
						<Command.Root>
							<Command.Input placeholder="Cari Status..." />
							<Command.List>
								<Command.Group>
									{#each formDbCombobox as form}
										<Command.Item
											value={form.value}
											onSelect={() => {
												if (formValue && formValue == form.value) {
													formValue = '';
												} else {
													formValue = form.value;
												}

												closeAndFocusTriggerForFormDbx();
											}}
										>
											<Check class={cn(formValue !== form.value && 'text-transparent')} />
											{form.label.replace('_', '-')}
										</Command.Item>
									{/each}
								</Command.Group>
							</Command.List>
						</Command.Root>
					</Popover.Content>
				</Popover.Root>
			</div>
		</div>
		<div class="my-5 flex flex-row items-center justify-center gap-5">
			<button
				onclick={() => {
					filterHandler();
				}}
				class="flex h-10 items-center rounded-md bg-black p-3 text-white transition-all ease-in-out hover:bg-blue-600 hover:text-white"
				>Filter</button
			>
			<button
				class="flex h-10 items-center rounded-md bg-black p-3 text-white transition-all ease-in-out hover:bg-blue-600 hover:text-white"
				onclick={() => {
					filter = '';
					statusValue = '';
					formValue = '';
					calenderValue = {
						start: new CalendarDate(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
						end: new CalendarDate(
							currentDate.getFullYear(),
							currentDate.getMonth() + 1,
							currentDate.getDate()
						)
					};
					pageFilter = 0;
					filterHandler();
				}}
				>Reset
			</button>
			{#if navigating.to}
				<Stretch color="#314986" />
			{/if}
		</div>
		<div class="overflow-x-auto px-5">
			<div
				class="border-gray-500s m-3 mx-auto max-h-[600px] w-[1000px] overflow-y-scroll rounded-md border-2"
			>
				<Table.Root>
					<Table.Header class="bg-uph">
						{#each table.getHeaderGroups() as headerGroup}
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
						{#each table.getRowModel().rows as row}
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
	</div>
	<div class="sticky bottom-0 pb-16">
		<Pagination.Root count={data.totalCount ?? 0} {perPage} {siblingCount}>
			{#snippet children({ pages })}
				<Pagination.Content>
					<Pagination.Item>
						<Pagination.PrevButton
							onclick={() => {
								pageFilter -= 1;
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
									isActive={pageFilter + 1 === page.value}
									onclick={() => {
										pageFilter = Number(page.value) - 1;
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
							onclick={() => {
								pageFilter += 1;
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
	</div>
{/if}
