<script lang="ts">
	import { goto } from '$app/navigation';
	import { navigating, page } from '$app/state';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import Badge, { badgeVariants } from '$lib/components/ui/badge/badge.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { createSvelteTable, FlexRender, renderComponent } from '$lib/components/ui/data-table';
	import DataTableBadgeCell from '$lib/components/ui/data-table/data-table-badge-cell.svelte';
	import DataTableLink from '$lib/components/ui/data-table/data-table-link.svelte';
	import DataTableMultipleRowCell from '$lib/components/ui/data-table/data-table-multiple-row-cell.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
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
	import { Bell } from 'lucide-svelte';
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
	let disabledExport = $state(false);

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
				toast.error(result.data?.message ?? 'Please Fill In the Form with Required Data', {
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

	let unfinishedRequest: RequestDbSchema[] = $state([]);
	const fetchRequestForReminder = async () => {
		try {
			const response = await fetch(
				`../../api/reminder?majorCode=${user.majorCode}&roleCode=${user.roleCode}`
			);
			return await response.json();
		} catch (error) {}
	};

	$effect.root(() => {
		fetchRequestForReminder().then((v) => {
			unfinishedRequest = v.pendingData;
		});
	});

	let disabledFilter = $state(false);
	$effect(() => {
		if (calenderValue.start == undefined && calenderValue.end == undefined) {
			toast.info('Please Select Both Start and End Date');
			disabledFilter = true;
		} else {
			disabledFilter = false;
		}

		if (data.totalCount == 0) {
			disabledExport = true;
		} else {
			disabledExport = false;
		}
	});

	$inspect(data.totalCount);

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

	const exportToExcelFunction = async () => {
		goto(
			`/home/export-excel?filter=${filter}&startDate=${new Date(calenderValue.start.toString()).toISOString().split('T')[0]}&endDate=${new Date(calenderValue.end.toString()).toISOString().split('T')[0]}&form=${formValue}&status=${statusValue}&major=${user.majorId}`
		);
	};

	let isMobile = $state(false);
	let windowWidth = $state(0);
	$effect(() => {
		if (windowWidth > 1000) {
			isMobile = false;
		} else {
			isMobile = true;
		}
	});

	let pendingDialogBool = $state(false);
</script>

<svelte:window bind:innerWidth={windowWidth} />
{#if user.roleCode == 'STD' && user.roleId}
	<div
		class={`mx-auto mb-10 flex min-h-screen flex-col rounded-md bg-white py-5 ${isMobile ? 'w-full max-w-[600px]' : 'max-w-[1000px]'}`}
	>
		<div class="wrapper-1 overflow-x-scroll p-10">
			<Accordion.Root
				type="single"
				class={`mx-auto my-auto flex ${isMobile ? 'w-[400px]' : 'w-[600px]'} flex-col justify-center`}
				value="item-1"
			>
				<Accordion.Item value="item-1">
					<span class="text-gray-500">Press CTRL + F to Search</span>
					<Accordion.Trigger class="text-2xl">Form Retrieval</Accordion.Trigger>
					<Accordion.Content class=" max-h-[550px] overflow-y-scroll">
						{#each data.formSelection as form}
							<Card.Root class="my-5 flex w-full items-center justify-between">
								<Card.Header class="px-5 py-0">
									<Card.Title class="text-xl">{form.name}</Card.Title>
									<Card.Description>{form.description ?? 'No Description'}</Card.Description>
								</Card.Header>
								<Card.Content class="grid gap-4">
									<div class="flex flex-col items-center justify-center gap-0.5 text-right">
										<Label>{form.code.replace('_', '-')}</Label>
										<span
											><a
												href={`${form.form_url}`}
												target="_blank"
												class="group relative text-[#3e74c5] no-underline"
											>
												View PDF
												<span
													class="absolute bottom-0 left-0 h-[2px] w-full origin-right scale-x-0 rounded-sm bg-uph transition-transform group-hover:origin-left group-hover:scale-x-100"
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
					<Accordion.Trigger class="text-2xl">Form Submission</Accordion.Trigger>
					<Accordion.Content>
						<form action="?/submit" enctype="multipart/form-data" method="post" use:enhance>
							<Form.Field {form} name="userId">
								<Form.Control let:attrs>
									<Input bind:value={user.userId} type="hidden" />
								</Form.Control>
							</Form.Field>
							<div class="flex flex-col gap-5">
								<div>
									<Label class="text-xl">User Name</Label>
									<Input value={user.username} disabled />
								</div>
								<div>
									<Label class="text-xl">User Email</Label>
									<Input value={user.email} disabled />
								</div>
							</div>
							<Form.Field {form} name="formId">
								<Form.Control let:attrs>
									<div class="my-5 flex w-full flex-col gap-5">
										<Form.Label class="text-xl"
											>Form Type <span class="text-red-700">*</span></Form.Label
										>
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
										</Select.Root>
									</div>
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Field {form} name="formFile">
								<Form.Control let:attrs>
									<div class="flex flex-col gap-5">
										<Form.Label class="text-xl"
											>{`Upload Your Form (Max Size Allowed :  5mb)`}
											<span class="text-red-700">*</span></Form.Label
										>
										<span class="text-sm"
											>(File Name Format :
											KodeForm-NIMPemohon-KodeJurusan(INF/IS/MGT/HOS/MGT/LAW)-EmailPemohon.pdf)</span
										>
										<!-- Kode Form pada penamaan file yang diupload jika tidak sama dengan yang dipilih, tidak dapat dilanjutkan -->
										<span class="text-red-600"
											>({'NOTE : The Form Code in the File Name must MATCH the one that you SELECTED'
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
		</div>
	</div>
{:else if user.roleCode == 'ADM' || user.roleCode == 'HOD'}
	<div class="mx-auto flex w-[1300px] flex-col rounded-md bg-white py-5">
		<div class="my-5 flex items-center justify-center gap-10">
			<div class="flex w-[150px] items-center justify-center rounded-full bg-uph py-2 text-white">
				<h1>Hi, {toTitleCase(user.username)}</h1>
			</div>
			<div class="relative inline-flex w-fit rounded-full">
				{#if unfinishedRequest?.length > 0}
					<div
						class="absolute bottom-auto left-auto right-0 top-1 z-10 inline-block -translate-y-1/2 translate-x-2/4 rotate-0 skew-x-0 skew-y-0 scale-x-100 scale-y-100 whitespace-nowrap rounded-full bg-red-600 px-2.5 py-1 text-center align-baseline text-xs font-bold leading-none text-white"
					>
						{unfinishedRequest?.length}
					</div>
				{/if}
				<button
					type="button"
					class="shadow-primary-3 hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 active:bg-primary-600 active:shadow-primary-2 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong inline-block rounded-full bg-uph px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white transition duration-150 ease-in-out focus:outline-none focus:ring-0 dark:shadow-black/30"
					data-twe-ripple-init
					data-twe-ripple-color="light"
					onclick={() => {
						pendingDialogBool = true;
					}}
				>
					<Bell />
				</button>
			</div>
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
				disabled={disabledFilter}
				class={`flex items-center rounded-md ${disabledFilter ? 'bg-gray-400' : 'bg-uphButton'} p-3 text-white`}
				>Filter</button
			>
			<button
				class={`flex items-center rounded-md p-3 text-white ${disabledFilter ? ' bg-gray-400' : 'bg-uphButton '}`}
				disabled={disabledFilter}
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
			<button
				class={`rounded-md ${disabledFilter || disabledExport ? ' bg-gray-400' : 'bg-uphButton '} p-3 text-white`}
				onclick={exportToExcelFunction}
				disabled={disabledFilter || disabledExport}
			>
				Export Excel
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
	<div
		class="sticky bottom-0 mx-auto my-5 flex w-[400px] items-center justify-center rounded-full bg-white py-2"
	>
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
							disabled={data.requestDbData.length == 0}
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
{:else}
	<div class="flex min-h-screen flex-col items-center justify-center">
		<span class="text-3xl">Hi, {user.username}</span>
	</div>
{/if}

<Dialog.Root bind:open={pendingDialogBool}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Pending Request</Dialog.Title>
			<Dialog.Description class="text-2xl">Please Process</Dialog.Description>
		</Dialog.Header>
		<div class="grid max-h-[300px] gap-10 overflow-y-scroll py-4">
			{#if unfinishedRequest?.length == 0}
				<span>Empty Pending Request. Good Job</span>
			{:else}
				{#each unfinishedRequest ?? [] as request}
					<a
						href={`user/${request?.user_credentials?.user_pkey}/detail/${request?.id}`}
						class="flex flex-col items-center justify-between px-5 hover:border-4 hover:border-x-2 hover:border-uph hover:p-2"
					>
						<span class="flex justify-between gap-5">
							<Badge color={badgeVariants({ variant: 'secondary' })}>{request?.status}</Badge>
							<span>
								{request?.request_code}
							</span>
						</span>
						<span>
							{new Date(request?.created_at).toLocaleDateString('en-us', {
								day: '2-digit',
								month: 'long',
								year: 'numeric'
							})}
						</span>
					</a>
				{/each}
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>

<style>
	.wrapper-1::-webkit-scrollbar {
		display: none;
	}
</style>
